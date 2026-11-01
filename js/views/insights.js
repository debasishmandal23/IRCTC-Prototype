/* IRCTC OneTrip — Business case for the jury (#/insights) — Builder B.
 * Survey figures come ONLY from OT.data.survey (real N=52 results). Case facts are quoted from Case 13.
 * Revenue model numbers are ILLUSTRATIVE ASSUMPTIONS and labelled as such.
 */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;
  var K = OT.dashkit, C = OT.charts;
  var t = K.t;
  var observer = null;

  if (OT.i18n && OT.i18n.extend) {
    OT.i18n.extend({ hi: {
      'ins.problem.h': 'बंधा हुआ यात्री, बिखरी हुई यात्रा',
      'ins.evidence.h': '52 रेल यात्रियों ने हमें क्या बताया',
      'ins.personas.h': 'चार यात्री, चार अहम पल',
      'ins.questions.h': 'बोर्ड के पाँच प्रश्नों के उत्तर',
      'ins.revenue.h': 'टिकट पर बोझ डाले बिना OneTrip कैसे कमाता है',
      'ins.guard.h': 'पहले जन-सेवा, फिर प्लेटफ़ॉर्म',
      'ins.frame.h': 'बिज़नेस इन द डिजिटल एज के नज़रिए से',
      'ins.road.h': 'रेल-प्रथम समन्वयक → पूर्ण यात्रा प्लेटफ़ॉर्म',
      'ins.tryDemo': 'यात्री डेमो आज़माएँ',
      'ins.how': 'एजेंट कैसे काम करते हैं',
      'ins.title': 'बिज़नेस केस',
      'ins.nav.problem': 'समस्या',
      'ins.nav.evidence': 'सर्वे के प्रमाण',
      'ins.nav.personas': 'पर्सोना',
      'ins.nav.questions': '5 केस प्रश्न',
      'ins.nav.revenue': 'राजस्व मॉडल',
      'ins.nav.guardrails': 'सामाजिक दायित्व',
      'ins.nav.frameworks': 'कोर्स फ्रेमवर्क',
      'ins.nav.roadmap': 'रोडमैप',
      'ins.hero.h': 'टिकट दरवाज़ा है, पूरी यात्रा नहीं।',
      'ins.hero.lede': 'IRCTC यात्रा की शुरुआत का मालिक है, पर होटल, कैब, भोजन और घूमना यात्री अलग-अलग ऐप में जोड़ते हैं। OneTrip टिकट के बाद पूरी यात्रा को एक भरोसेमंद, बहुभाषी डैशबोर्ड में लाता है।'
    } });
  }

  var S = function () { return OT.data.survey; };
  var pctF = function (v) { return Number(v).toFixed(1) + '%'; };
  var N = function () { return S().meta.n_responses; };
  function nTag(extra) { return '<span class="n-tag">' + OT.icon('check', 11) + 'N=' + N() + ' ' + esc(t('ins.survey', 'survey')) + (extra ? ' · ' + esc(extra) : '') + '</span>'; }
  function assume() { return '<span class="assume-tag">' + esc(t('ins.assume', 'ILLUSTRATIVE ASSUMPTIONS')) + '</span>'; }
  function chap(id, no, label, title, kicker, body) {
    return '<section class="chap" id="ch-' + id + '" data-chap="' + id + '"><div class="chap-no" aria-hidden="true">' + no + '<small>' + esc(label) + '</small></div><div style="min-width:0"><h2>' + title + '</h2>' + (kicker ? '<p class="kicker">' + kicker + '</p>' : '') + body + '</div></section>';
  }
  function short(label) {
    var map = {
      'Coordinating arrival time with check-in / other bookings': 'Coordinating arrival with check-in',
      'Trusting providers or understanding cancellation/refund terms': 'Trusting providers / refund terms',
      'See journey details and selected arrangements in one place': 'Journey + arrangements in one place',
      'Find accommodation relevant to my destination and dates': 'Accommodation for my dates',
      'See transparent prices, ratings and cancellation terms': 'Transparent prices, ratings, terms',
      'Arrange local transport / station transfers': 'Local transport / station transfer',
      'Discover sightseeing and tourism experiences': 'Sightseeing & tourism',
      'Unclear cancellation, refund or customer-support responsibility': 'Unclear refund / support owner',
      'I do not usually arrange additional services': 'Nothing extra',
      'Someone else usually books for me': 'Someone else books'
    };
    return map[label] || label;
  }

  /* ---------- 01 Problem ---------- */
  function problem() {
    var rev = [{ label: 'Catering', value: 45.60 }, { label: 'Internet ticketing', value: 30.33 }, { label: 'Tourism, Rail Neer & other (remainder)', value: Math.round((100 - 45.60 - 30.33) * 100) / 100 }];
    var body = '<div class="split">' +
      '<div><div class="journey-frag" aria-label="Fragmented journey versus one dashboard">' +
        '<div class="frag-apps">' + [['train', 'IRCTC ticket'], ['hotel', 'Hotel app'], ['cab', 'Cab app'], ['food', 'Food app'], ['sight', 'Tour site'], ['chat', 'WhatsApp for times']].map(function (x) { return '<span>' + OT.icon(x[0], 16) + esc(x[1]) + '</span>'; }).join('') + '</div>' +
        '<div class="frag-arrow">' + OT.icon('arrowRight', 34) + '</div>' +
        '<div class="frag-one"><strong>' + esc(t('ins.oneJourney', 'One journey, one dashboard')) + '</strong><small>' + esc(t('ins.oneJourney2', 'PNR-anchored itinerary · verified options · one refund owner · your language')) + '</small></div></div>' +
        '<ul class="stack" style="padding-left:18px;margin:0">' +
          '<li>' + t('ins.p1', 'IRCTC owns the <strong>start</strong> of the trip: <strong>82.68%</strong> of reserved bookings, up to <strong>12.38 lakh</strong> tickets a day, <strong>12.21 crore+</strong> app downloads.') + '</li>' +
          '<li>' + t('ins.p2', 'Yet ticketing is only <strong>30.33%</strong> of revenue. Hotels, station transfers, meals and sightseeing — the bigger share of journey value — are bought elsewhere.') + '</li>' +
          '<li>' + t('ins.p3', 'The captive, repeat base interacts narrowly: book, pay, leave. Our survey shows the hardest part is fitting the arrival time to check-in and other bookings.') + '</li>' +
          '<li>' + t('ins.p4', 'The constraint: ticketing must stay fast, affordable and uncluttered — IRCTC is a public utility with a social mandate.') + '</li></ul></div>' +
      K.pane(t('ins.revMix', 'IRCTC revenue mix (as reported in the case)'), esc(t('ins.revMixSub', 'Period-specific case figures; “other” is the derived remainder.')), C.donut(rev, { colors: [C.palette.navy, C.palette.saffron, '#9DB4D8'], center: '30.33%', sub: t('ins.ticketing', 'ticketing'), fmt: pctF, showPct: false, label: 'IRCTC revenue mix' }) +
        '<p class="small" style="margin-top:12px">' + esc(t('ins.revMixNote', 'Catering already runs in 1,250+ trains and 400 stations; pilgrimage trains carry 5.48 lakh passengers a year. The assets exist — they are not connected around the traveller.')) + '</p>') +
      '</div>';
    return chap('problem', '01', t('ins.nav.problem', 'Problem'), t('ins.problem.h', 'A captive traveller, a fragmented journey'), '', body);
  }

  /* ---------- 02 Evidence ---------- */
  function evidence() {
    var s = S(), h = s.headline, q = s.questions, x = s.crosstabs;
    var tiles = [
      [h.books_on_irctc_pct, t('ins.t1', 'book their train ticket on IRCTC (website 42.3% + Rail Connect 36.5%)')],
      [h.arranges_at_least_one_addon_pct, t('ins.t2', 'arrange at least one add-on: hotel, cab, food, insurance or tour')],
      [h.coordination_pain_pct, t('ins.t3', 'struggle to coordinate arrival time with check-in — the #1 difficulty'), true],
      [h.explore_top2_pct, t('ins.t4', 'likely to explore OneTrip if relevant, competitive and clear (4–5 of 5)')],
      [h.trust_related_concern_pct, t('ins.t5', 'name trust as the biggest concern: refund owner (23.1%) or reliability (21.2%)')]
    ];
    var diff = s.opts('difficulties', { sort: true }).map(function (o) { return { label: short(o.label), value: o.pct, highlight: /Coordinating/.test(o.label), muted: /No significant|Other/.test(o.label), tip: o.label + ': ' + o.pct + '% (' + o.count + ' of ' + N() + ')' }; });
    var add = s.opts('addon_services', { sort: true }).map(function (o) { return { label: short(o.label), value: o.pct, highlight: /Hotel/.test(o.label), muted: /not usually|Other/.test(o.label), tip: o.label + ': ' + o.pct + '% (' + o.count + ')' }; });
    var feat = s.opts('most_valuable_feature').map(function (o) { return { label: short(o.label), value: o.pct, highlight: /one place/.test(o.label), muted: /None/.test(o.label), tip: o.label + ': ' + o.pct + '% (' + o.count + ')' }; });
    var lik = function (k) { return q[k].options.map(function (o) { return o.pct; }); };
    var cnt = function (k) { return q[k].options.map(function (o) { return o.count; }); };
    var conc = s.opts('biggest_concern').map(function (o) { return { label: short(o.label), value: o.pct, highlight: /Unclear|reliability/.test(o.label), muted: /No major|Other/.test(o.label), tip: o.label + ': ' + o.pct + '% (' + o.count + ')' }; });
    var fixes = [['Unclear refund / support owner', 'Escrow-backed refunds + refund owner printed on every card'], ['Provider/service reliability', 'Verification Agent: source + checked time on every price'], ['I prefer using separate apps', 'Optional, dismissible; ticket flow untouched'], ['Too many promotions', 'Max one card per stage; no ads in disruption messages'], ['Prices may not be competitive', 'Price comparison; lowest option always shown'], ['Data privacy', 'DPDP consent centre; partners see aggregates only']];
    var chan = s.opts('booking_channel').map(function (o) { return { label: short(o.label), value: o.pct, tip: o.label + ': ' + o.pct + '% (' + o.count + ')' }; });
    var freq = x.frequency_vs_usefulness.map(function (r) { return { label: r.segment, short: r.segment.replace('At least once a month', 'Monthly+').replace('Every 2–3 months', 'Every 2–3 mo').replace('A few times a year', 'Few times/yr').replace('Once a year or less', '≤ once/yr'), value: r.mean, highlight: r.mean === Math.max.apply(null, x.frequency_vs_usefulness.map(function (z) { return z.mean; })), tip: r.segment + ' (n=' + r.n + '): mean usefulness ' + r.mean.toFixed(2) + ' / 5 · top-2 ' + r.top2_pct + '%' }; });

    var body = '<div class="stat-row">' + tiles.map(function (tl) { return '<div><b class="' + (tl[2] ? 'hi' : '') + '">' + esc(pctF(tl[0])) + '</b><span>' + esc(tl[1]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="evid">' +
        K.pane(t('ins.c1', 'Where travellers struggle'), nTag(t('ins.multi', 'multi-select')), C.hbar(diff, { fmt: pctF, label: 'Planning difficulties' }) + '<div class="so-what">' + t('ins.c1so', 'So what: <b>coordination</b>, not discovery, is the pain. The Itinerary Agent flags the 11:05 arrival vs 14:00 check-in gap.') + '</div>') +
        K.pane(t('ins.c2', 'What travellers already arrange'), nTag(t('ins.multi', 'multi-select')), C.hbar(add, { fmt: pctF, label: 'Add-on services arranged' }) + '<div class="so-what">' + t('ins.c2so', 'So what: hotels lead (<b>30.8%</b>) — the beachhead. 44.2% arrange nothing, so OneTrip must stay optional.') + '</div>') +
        K.pane(t('ins.c3', 'Most valuable OneTrip feature'), nTag(t('ins.single', 'single choice')), C.hbar(feat, { fmt: pctF, label: 'Most valuable feature' }) + '<div class="so-what">' + t('ins.c3so', 'So what: MVP priority = <b>one-place journey</b> (36.5%), then station transfer, then hotels.') + '</div>') +
        K.pane(t('ins.c4', 'Concept response (1–5)'), nTag(), C.stack100([
          { label: t('ins.useful', 'How useful would OneTrip be?'), note: 'top-2 ' + pctF(q.usefulness.top2_box_pct) + ' · mean ' + q.usefulness.mean, values: lik('usefulness'), counts: cnt('usefulness') },
          { label: t('ins.explore', 'Likely to explore it?'), note: 'top-2 ' + pctF(q.likelihood_to_explore.top2_box_pct) + ' · mean ' + q.likelihood_to_explore.mean, values: lik('likelihood_to_explore'), counts: cnt('likelihood_to_explore') }
        ], ['1 (low)', '2', '3', '4', '5 (high)'], { colors: C.palette.likert }) + '<div class="so-what">' + t('ins.c4so', 'So what: <b>69.2%</b> would explore it — if services are relevant, prices competitive and terms clear.') + '</div>') +
        K.pane(t('ins.c5', 'Pain drives demand'), nTag(t('ins.cross', 'cross-tab')), C.bar(x.pain_vs_usefulness.map(function (r, i) { return { label: r.segment, short: i ? 'No real difficulty (n=' + r.n + ')' : 'Reports a difficulty (n=' + r.n + ')', value: r.top2_pct, highlight: i === 0, tip: r.segment + ' (n=' + r.n + '): ' + r.top2_pct + '% rate OneTrip useful (4–5)' }; }), { max: 100, fmt: pctF, fmtTick: function (v) { return v + '%'; }, xLabelLines: 2, h: 220, barRatio: 0.45, label: 'Usefulness by pain' }) + '<div class="so-what">' + t('ins.c5so', 'So what: those with a real difficulty are <b>2.3×</b> as likely to find it useful (68.6% vs 29.4%).') + '</div>') +
        K.pane(t('ins.c6', 'More add-ons, more intent'), nTag(t('ins.cross', 'cross-tab')), C.bar(x.addon_count_vs_explore.map(function (r, i) { return { label: r.segment, short: C.narrow() ? r.segment : r.segment + ' (n=' + r.n + ')', value: r.top2_pct, highlight: i === 2, tip: r.segment + ' (n=' + r.n + '): ' + r.top2_pct + '% likely to explore' }; }), { max: 100, fmt: pctF, fmtTick: function (v) { return v + '%'; }, h: 220, barRatio: 0.5, label: 'Intent by number of add-ons' }) + '<div class="so-what">' + t('ins.c6so', 'So what: complex trips are the target — <b>81.8%</b> intent among 2+ add-on travellers.') + '</div>') +
        K.pane(t('ins.c7', 'What could stop adoption — and our fix'), nTag(t('ins.single', 'single choice')), C.hbar(conc, { fmt: pctF, label: 'Biggest concern' }) +
          '<div class="table-wrap" style="margin-top:12px"><table class="table"><thead><tr><th>' + esc(t('ins.concern', 'Concern')) + '</th><th>' + esc(t('ins.fix', 'OneTrip fix')) + '</th></tr></thead><tbody>' + fixes.map(function (f) { return '<tr><td>' + esc(f[0]) + '</td><td>' + esc(f[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        '<div class="stack">' +
          K.pane(t('ins.c8', 'Where they book the ticket'), nTag(), C.donut(chan, { colors: [C.palette.navy, C.palette.blue, '#9DB4D8', C.palette.saffron, '#C9D1DC'], center: pctF(h.books_on_irctc_pct), sub: t('ins.onIrctc', 'on IRCTC'), fmt: pctF, showPct: false, label: 'Booking channel' })) +
          K.pane(t('ins.c9', 'Who values it most'), nTag(t('ins.cross', 'cross-tab')) + ' ' + esc(t('ins.c9sub', 'mean usefulness, 1–5')), C.bar(freq, { max: 5, fmt: function (v) { return v.toFixed(2); }, fmtTick: function (v) { return v.toFixed(0); }, h: 210, label: 'Usefulness by travel frequency' }) + '<div class="so-what">' + t('ins.c9so', 'So what: <b>infrequent</b> travellers (≤ once a year, n=20) rate it highest (3.90) — they plan bigger, less practised trips.') + '</div>') +
        '</div>' +
      '</div>' +
      '<p class="small muted" style="margin-top:14px">' + OT.icon('info', 14) + ' ' + esc(t('ins.caveat', 'Survey: N=52 convenience sample, 28–31 Oct 2026, weighted toward occasional travellers (7.7% travel monthly). Stated intent, not conversion. 5 respondents ticked “none” alongside a service in Q4 and 5 in Q6. The survey did not ask about language, voice, age, city or willingness to pay — so multilingual support rests on the brief and the public-service mandate, not on this data.')) + '</p>';
    return chap('evidence', '02', t('ins.nav.evidence', 'Survey evidence'), t('ins.evidence.h', 'What 52 rail travellers told us'), t('ins.evidence.k', 'Real responses from our 10-question survey. Every number below is computed from the form export.'), body);
  }

  /* ---------- 03 Personas ---------- */
  function personas() {
    var P = [
      { i: 'SS', c: C.palette.navy, n: 'Sunita Sharma', r: 'Hindi-speaking family traveller · NDLS → CDG, 2 pax', seg: 'Proxy: arranges hotel (n=16) · 81.2% likely to explore', pain: 'Train arrives 11:05, check-in 14:00; needs a station cab and a hotel under ₹3,000.', want: 'One-place itinerary; hotel near the station.', worry: 'Prices may not be competitive.', moment: 'Speaks in Hindi: “मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए”. Gets verified options and an arrival-gap fix.' },
      { i: 'RI', c: C.palette.cat[2], n: 'Ramesh Iyer', r: 'Once-a-year pilgrim · Chennai → Varanasi with elderly parents', seg: 'Proxy: once a year or less (n=20) · usefulness 3.90', pain: 'Coordination (8), comparing prices (7), accommodation (6).', want: 'Tamil interface, read-aloud for parents, stay near the ghats.', worry: 'Who is responsible for refunds and support.', moment: 'Refund policy read aloud in Tamil; PNR, fares and dates stay untranslated.' },
      { i: 'AR', c: C.palette.cat[3], n: 'Arjun', r: 'Student / occasional traveller · Pune → home', seg: 'Proxy: a few times a year (n=17) · least enthusiastic (41.2% useful)', pain: 'Usually arranges nothing extra, sometimes insurance (6 of 17).', want: 'Nothing that slows the ticket.', worry: 'Prefers separate apps; reliability.', moment: 'Sees one dismissible card after booking: a ₹250 meal on a 9-hour journey.' },
      { i: 'NK', c: C.palette.saffron, n: 'Neha Kulkarni', r: 'Frequent business traveller · every 2–3 months', seg: 'Proxy: frequent (n=15) · 73.3% likely to explore', pain: 'Coordination (5), local transport (4), tracking bookings (4).', want: 'Delay-aware station transfer, GST invoices, rewards card.', worry: 'Data privacy (3 of 15 — highest of any segment).', moment: 'Pickup re-timed automatically when the train runs 40 min late; consent centre shows exactly what is shared.' }
    ];
    var body = '<div class="personas">' + P.map(function (p) {
      return '<article class="persona"><div class="row"><span class="avatar" style="background:' + p.c + '">' + esc(p.i) + '</span><div><h3>' + esc(p.n) + '</h3><div class="seg">' + esc(p.r) + '</div></div></div>' +
        '<span class="n-tag" style="align-self:flex-start">' + esc(p.seg) + '</span>' +
        '<dl><dt>' + esc(t('ins.pain', 'Pain')) + '</dt><dd>' + esc(p.pain) + '</dd><dt>' + esc(t('ins.wants', 'Wants')) + '</dt><dd>' + esc(p.want) + '</dd><dt>' + esc(t('ins.worry', 'Worry')) + '</dt><dd>' + esc(p.worry) + '</dd></dl>' +
        '<div class="moment"><strong>' + esc(t('ins.moment', 'OneTrip moment')) + ':</strong> ' + esc(p.moment) + '</div></article>';
    }).join('') + '</div><p class="small muted" style="margin-top:10px">' + esc(t('ins.personaNote', 'Behaviour comes from survey segments; names, languages and routes are illustrative.')) + '</p>';
    return chap('personas', '03', t('ins.nav.personas', 'Personas'), t('ins.personas.h', 'Four travellers, four moments that matter'), '', body);
  }

  /* ---------- 04 Five case questions ---------- */
  function questions() {
    var prods = OT.data.analytics.products;
    var qa = function (n, title, sub, body, open) {
      return '<details class="qa"' + (open ? ' open' : '') + '><summary><span class="qn">Q' + n + '</span><div><h3>' + esc(title) + '</h3><p>' + esc(sub) + '</p></div><span class="chev">' + OT.icon('chevronDown', 20) + '</span></summary><div class="qa-body">' + body + '</div></details>';
    };
    var q1 = '<div class="two-col-list"><div><h4>' + OT.icon('checkCircle', 18) + esc(t('ins.q1.right', 'What IRCTC gets right')) + '</h4><ul>' +
      '<li>High-intent reach at the moment of booking: 78.8% of respondents book on IRCTC; 82.68% market share (case).</li>' +
      '<li>Adjacent assets already exist: catering (45.60% of revenue), tourism and pilgrimage trains, hotels, its own payment gateway.</li>' +
      '<li>First-party journey signals — origin, destination, date, frequency, co-passengers — richer than any OTA has for rail.</li>' +
      '<li>Public-sector trust: a reason to believe refund promises.</li></ul></div>' +
      '<div><h4>' + OT.icon('alert', 18) + esc(t('ins.q1.gaps', 'Where the gaps are')) + '</h4><ul>' +
      '<li>Services sit in silos; no single trip view (coordination is the #1 pain, one-place view the #1 feature: both 36.5%).</li>' +
      '<li>Unclear accountability across providers: trust concerns total 44.2%.</li>' +
      '<li>Thin personalisation; OTAs already sell rail plus everything else.</li>' +
      '<li>No language-inclusive, voice-first layer (from the brief and mandate, not the survey).</li>' +
      '<li>Cross-sell risks friction: 13.5% fear too many promotions.</li></ul></div></div>' +
      '<p class="kicker" style="margin-top:12px"><strong>' + esc(t('ins.q1.ans', 'Our answer:')) + '</strong> ' + esc(t('ins.q1.ans2', 'OneTrip is an optional, rail-anchored coordination layer that starts only after the ticket is confirmed — AI+ (a redesigned journey), not +AI (a chatbot bolted on).')) + '</p>';
    var tp = [['Search & booking', 'Origin/destination, train, class, date, lead time, fare, party size (adult/child/senior), language, voice vs typed', 'Itinerary seed, demand forecast, language routing'],
      ['Payment', 'Method category (UPI/card), amount, success/failure, refund status, settlement ref', 'Reconciliation, failure recovery, rewards eligibility'],
      ['Pre-journey planning', 'Saved trips, hotel/cab searches, budget, card views/dismissals, insurance opt-in', 'Relevance tuning, frequency caps'],
      ['Journey (in-train)', 'Running status, delay/ETA, coach/berth for meals, e-catering orders, PNR changes', 'Delay-aware transfer re-timing, disruption alerts'],
      ['Stay (destination)', 'Hotel, check-in/out, early check-in need, pickup time, tour bookings', 'Arrival/check-in gap detection, Demand Radar'],
      ['Post-trip', 'Ratings, complaints, refund TAT, support resolution, repeat booking, translation feedback', 'Partner scorecards, BHASHINI quality monitoring']];
    var q2 = '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('ins.touch', 'Touchpoint')) + '</th><th>' + esc(t('ins.params', 'Data parameters')) + '</th><th>' + esc(t('ins.use', 'Use')) + '</th></tr></thead><tbody>' + tp.map(function (r) { return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:8px">' + esc(t('ins.q2note', 'One journey ID links them. Consent first, purpose-limited, no continuous GPS; partners get aggregates with cohorts under 50 suppressed. See Admin → Platform health for the five data types.')) + '</p>';
    var q3 = '<div class="two-col-list"><div><h4>' + OT.icon('user', 18) + esc(t('ins.q3.trav', 'To travellers: moment-based, not mass')) + '</h4><ul>' +
      '<li>Booking confirmed to Chandigarh → hotels within 2 km of CDG with total price, provider and cancellation terms.</li>' +
      '<li>Arrival 11:05 vs check-in 14:00 → early check-in, cloakroom or a Rock Garden visit.</li>' +
      '<li>Journey over 8 h → a meal at the next e-catering station.</li>' +
      '<li>Party of 4+ or seniors → SUV transfer or accessible room.</li>' +
      '<li>Disruption → refund and rebooking help only, <strong>never an ad slot</strong>.</li>' +
      '<li>In the traveller’s language, with “Sponsored” labels translated too. Max one card per stage.</li></ul></div>' +
      '<div><h4>' + OT.icon('store', 18) + esc(t('ins.q3.part', 'To partners: “OneTrip Insights”')) + '</h4><ul>' +
      '<li><strong>Demand Radar</strong>: aggregated arrivals by destination, date and origin (k ≥ 50).</li>' +
      '<li><strong>Sponsored Stay/Ride</strong>: labelled, CPC or cost-per-booking; can outrank a better option by at most one slot.</li>' +
      '<li><strong>Campaign Studio</strong>: budget, dates, geography — IRCTC enforces eligibility and frequency.</li>' +
      '<li><strong>Partner scorecard</strong>: views → bookings, cancellations, complaints, rating; good scores earn ranking.</li>' +
      '<li>KPIs: qualified reach, CTR, incremental bookings vs holdout, dismiss and opt-out rates.</li></ul></div></div>';
    var q4 = '<div class="two-col-list"><div><h4>' + OT.icon('bank', 18) + esc(t('ins.q4.h', 'Banks run the money rails; IRCTC runs the trip')) + '</h4><ul>' +
      '<li><strong>Acquiring</strong>: one UPI/card checkout for ticket + add-ons, split settlement.</li>' +
      '<li><strong>Escrow</strong>: partner money held until the service is delivered → instant refunds. Directly answers the 23.1% refund-owner concern.</li>' +
      '<li><strong>Settlement T+1</strong> net of commission, with GST invoices.</li>' +
      '<li><strong>Fraud, KYC, disputes</strong>: video-KYC for partners, chargebacks, AML.</li>' +
      '<li><strong>Credit</strong> last: partner working capital on consented sales data (Account Aggregator); traveller EMI only with APR shown.</li></ul></div>' +
      '<div><h4>' + OT.icon('shield', 18) + esc(t('ins.q4.r', 'Who is responsible for what')) + '</h4><ul>' +
      '<li><strong>IRCTC</strong>: platform, trip, recommendation rules, first-line support.</li>' +
      '<li><strong>Partner</strong>: fulfilment, accurate prices, its refund obligation.</li>' +
      '<li><strong>Bank</strong>: money movement, credit risk, financial grievances.</li>' +
      '<li>The bank does <strong>not</strong> get the full itinerary by default.</li></ul>' +
      '<a class="btn btn-sm btn-ghost" href="#/admin/finance">' + esc(t('ins.seeBank', 'See the bank dashboard')) + ' ' + OT.icon('arrowRight', 14) + '</a></div></div>';
    var segs = ['Retail traveller', 'Tourism partner', 'Financial inclusion'];
    var q5 = '<div class="trio">' + segs.map(function (sg) {
      return '<div class="pane"><div class="eyebrow">' + esc(sg) + '</div>' + prods.filter(function (p) { return p.seg === sg; }).map(function (p) {
        return '<div style="margin-top:10px"><strong style="color:var(--navy)">' + esc(p.name) + '</strong><div class="small">' + esc(p.what) + '</div><div class="xs muted">' + esc(t('ins.kpi', 'Pilot KPI')) + ': ' + esc(p.target) + '</div></div>';
      }).join('') + '</div>';
    }).join('') + '</div><p class="small muted" style="margin-top:10px">' + assume() + ' ' + esc(t('ins.q5note', 'Proposed concepts issued by a regulated bank / licensed insurer. Optional, never pre-ticked, never a condition of rail travel. Sequence: payments & escrow → rewards & insurance → merchant tools → partner credit → traveller credit last.')) + '</p>';
    var body = qa(1, t('ins.q1', 'Solution review'), t('ins.q1s', 'Right foundation, fragmented journey'), q1, true) +
      qa(2, t('ins.q2', 'Data parameters'), t('ins.q2s', 'One journey ID, consented data at every touchpoint'), q2) +
      qa(3, t('ins.q3', 'Marketing & advertising'), t('ins.q3s', 'Moment-based for travellers; insights and labelled placements for partners'), q3) +
      qa(4, t('ins.q4', 'Role of banks'), t('ins.q4s', 'Escrow, settlement, fraud and credit — alongside IRCTC and partners'), q4) +
      qa(5, t('ins.q5', 'Financial products for 3 segments'), t('ins.q5s', 'Retail traveller · Tourism partner · Financial inclusion'), q5);
    return chap('questions', '04', t('ins.nav.questions', '5 case questions'), t('ins.questions.h', 'Answering the board’s five questions'), '', body);
  }

  /* ---------- 05 Revenue ---------- */
  var LINES = [
    { key: 'hotel', name: 'Hotel / stay', aov: 3750, take: 12, attach: 3, max: 8, step: 0.5 },
    { key: 'cab', name: 'Station transfer / cab', aov: 450, take: 10, attach: 4, max: 10, step: 0.5 },
    { key: 'food', name: 'E-catering meal', aov: 250, take: 15, attach: 5, max: 10, step: 0.5 },
    { key: 'tour', name: 'Sightseeing / tour', aov: 1200, take: 15, attach: 1, max: 4, step: 0.25 }
  ];
  var calc = null;
  function resetCalc() { calc = { attach: {}, takeAdj: 0, tickets: 6 }; LINES.forEach(function (l) { calc.attach[l.key] = l.attach; }); }
  function compute() {
    var net = 0, gbv = 0;
    LINES.forEach(function (l) { var a = calc.attach[l.key] / 100; gbv += a * l.aov; net += a * l.aov * Math.max(0, l.take + calc.takeAdj) / 100; });
    var perYear = calc.tickets * 1e5 * 365;
    return { gbv: gbv, net: net, annualNet: net * perYear, annualGbv: gbv * perYear };
  }
  function revenue() {
    var m = S().illustrative_business_model, sc = m.scenarios;
    var names = ['Conservative', 'Base', 'Upside'];
    var series = sc.Base.per_100k_bookings.map(function (ln, i) { return { name: ln.line, values: names.map(function (n) { return sc[n].per_100k_bookings[i].net_revenue_inr; }) }; });
    if (!calc) resetCalc();
    var sliders = LINES.map(function (l) {
      return '<div class="slider"><label for="sl-' + l.key + '"><span>' + esc(l.name) + ' ' + esc(t('ins.attach', 'attach')) + '</span><b data-out="' + l.key + '">' + calc.attach[l.key] + '%</b></label><input type="range" id="sl-' + l.key + '" data-line="' + l.key + '" min="0" max="' + l.max + '" step="' + l.step + '" value="' + calc.attach[l.key] + '"><span class="hint">AOV ' + OT.inr(l.aov) + ' · take-rate ' + l.take + '% · base ' + l.attach + '%</span></div>';
    }).join('') +
      '<div class="slider"><label for="sl-take"><span>' + esc(t('ins.takeAdj', 'Take-rate adjustment (all lines)')) + '</span><b data-out="take">' + (calc.takeAdj > 0 ? '+' : '') + calc.takeAdj + ' pp</b></label><input type="range" id="sl-take" min="-4" max="4" step="1" value="' + calc.takeAdj + '"><span class="hint">' + esc(t('ins.takeHint', 'Typical marketplace bands — to be validated with partners')) + '</span></div>' +
      '<div class="slider"><label for="sl-tix"><span>' + esc(t('ins.tix', 'Tickets per day seeing OneTrip')) + '</span><b data-out="tix">' + calc.tickets + ' lakh</b></label><input type="range" id="sl-tix" min="1" max="12" step="0.5" value="' + calc.tickets + '"><span class="hint">' + esc(t('ins.tixHint', 'Base 6 lakh ≈ 48% of the case peak of 12.38 lakh/day')) + '</span></div>';
    var body = '<p>' + assume() + ' <span class="small muted">' + esc(m.basis.attach_rates) + '</span></p>' +
      '<div class="rev-model">' +
        K.pane(t('ins.scen', 'Net revenue per 1,00,000 ticket bookings'), esc(t('ins.scenSub', 'Gross commission by service line, three scenarios (₹)')), C.stacked(names, series, { fmt: OT.inr, fmtLabel: function (v) { return K.lakh(v); }, h: 260, label: 'Revenue scenarios' }) +
          '<div class="table-wrap" style="margin-top:12px"><table class="table"><thead><tr><th>' + esc(t('ins.scenario', 'Scenario')) + '</th><th class="num">' + esc(t('ins.netBk', 'Net / booking')) + '</th><th class="num">' + esc(t('ins.gbvYr', 'GBV / yr')) + '</th><th class="num">' + esc(t('ins.commYr', 'Gross commission / yr')) + '</th></tr></thead><tbody>' +
            names.map(function (n) { return '<tr><td>' + esc(n) + '</td><td class="num">₹' + sc[n].net_rev_per_booking_inr.toFixed(2) + '</td><td class="num">₹' + Math.round(sc[n].annual_gbv_inr_cr).toLocaleString('en-IN') + ' Cr</td><td class="num"><strong>₹' + Math.round(sc[n].annual_net_rev_inr_cr_at_6lakh_tickets_per_day).toLocaleString('en-IN') + ' Cr</strong></td></tr>'; }).join('') + '</tbody></table></div>' +
          '<p class="small muted" style="margin-top:8px">' + esc(t('ins.scenNote', 'Per booking: Conservative ₹{c} · Base ₹{b} · Upside ₹{u} net; Base GBV ₹{g} per booking.', { c: sc.Conservative.net_rev_per_booking_inr, b: sc.Base.net_rev_per_booking_inr, u: sc.Upside.net_rev_per_booking_inr, g: sc.Base.gbv_per_booking_inr })) + '</p>') +
        '<div class="pane"><h3>' + esc(t('ins.calc', 'Try it: attach-rate & take-rate calculator')) + '</h3><p class="pane-sub">' + esc(t('ins.calcSub', 'Gross commission = Σ attach × AOV × take-rate × tickets. Before servicing, incentive, payment and refund costs.')) + '</p>' +
          '<div class="rev-out" aria-live="polite"><div><span>' + esc(t('ins.netPer', 'Net / booking')) + '</span><b data-res="net"></b></div><div><span>' + esc(t('ins.gbvPer', 'GBV / booking')) + '</span><b data-res="gbv"></b></div><div><span>' + esc(t('ins.annual', 'Gross commission / yr')) + '</span><b class="hi" data-res="annual"></b></div></div>' +
          '<div class="sliders" style="margin-top:14px">' + sliders + '</div>' +
          '<div class="row-wrap" style="margin-top:12px">' + names.map(function (n) { return '<button class="chip" data-scen="' + n + '">' + esc(n) + '</button>'; }).join('') + '</div></div>' +
      '</div>' +
      '<div class="trio" style="margin-top:16px">' +
        K.pane(t('ins.streams', 'Other revenue streams (not modelled)'), '', '<ul class="small" style="margin:0;padding-left:18px"><li>Partner ads & Demand Radar subscriptions</li><li>Payments: MDR share and escrow float (via bank)</li><li>Financial-product distribution fees</li><li>Own inventory: tourism packages, catering, Rail Neer</li></ul>') +
        K.pane(t('ins.jury', 'Metrics we will be judged on'), '', '<ul class="small" style="margin:0;padding-left:18px"><li><strong>Attach rate</strong> — trips with ≥ 1 add-on ÷ tickets</li><li><strong>Take-rate</strong> — blended base 12.2%</li><li><strong>AOV uplift</strong> — base +15.5% (₹155 GBV per booking)</li><li><strong>Funnel</strong> — card seen → opened → added → paid</li></ul>') +
        K.pane(t('ins.guardM', 'Guardrail metrics (equally important)'), '', '<ul class="small" style="margin:0;padding-left:18px"><li>Ticket booking time & success rate: unchanged</li><li>Dismiss and opt-out rates</li><li>Complaints per 1,000 add-on bookings; refund TAT</li><li>Share of non-English and voice sessions</li></ul>') +
      '</div>';
    return chap('revenue', '05', t('ins.nav.revenue', 'Revenue model'), t('ins.revenue.h', 'How OneTrip makes money without taxing the ticket'), '', body);
  }
  function paintCalc(root) {
    var r = compute();
    var set = function (k, v) { var e = root.querySelector('[data-res="' + k + '"]'); if (e) e.textContent = v; };
    set('net', '₹' + r.net.toFixed(2));
    set('gbv', '₹' + r.gbv.toFixed(1));
    set('annual', '₹' + Math.round(r.annualNet / 1e7).toLocaleString('en-IN') + ' Cr');
  }

  /* ---------- 06 Guardrails ---------- */
  function guardrails() {
    var g = [
      ['train', 'Ticketing stays fast', 'OneTrip appears only after ticket confirmation — never inside Tatkal or checkout. KPI: zero change in booking success or latency.', 'Core public-utility licence to operate'],
      ['rupee', 'Affordability first', 'No dynamic pricing on rail fares; budget filters first; lowest option always shown; prices include tax.', 'Pricing is politically sensitive (case)'],
      ['filter', 'No aggressive cross-sell', 'Max one card per stage, frequency caps, one-tap dismiss, Sponsored labels, no ads in disruption messages.', '13.5% fear too many promotions; 15.4% prefer separate apps'],
      ['shield', 'Trust & accountability', 'Provider, refund owner, helpline and data timestamp on every card; escrow refunds; Verification Agent on every price.', 'Trust concerns total 44.2%'],
      ['lock', 'Privacy by design (DPDP Act, 2023)', 'Consent first, purpose limitation, data stored in India, right to erase, partners see aggregates only, bank never gets the full itinerary.', '7.7% name privacy; frequent travellers most sensitive'],
      ['globe', 'Language safety', 'PNR, train no., fares, dates and station codes never translated; policy text keeps the original; low-confidence translations go to a human.', 'Brief: translation safeguards']
    ];
    var body = '<div class="guards">' + g.map(function (x) { return '<div class="guard"><h4>' + OT.icon(x[0], 18) + esc(t('ins.g.' + x[0], x[1])) + '</h4><p>' + esc(x[2]) + '</p><span class="ev">' + esc(x[3]) + '</span></div>'; }).join('') + '</div>';
    return chap('guardrails', '06', t('ins.nav.guardrails', 'Social mandate'), t('ins.guard.h', 'A public utility first, a platform second'), esc(t('ins.guard.k', 'Inclusion and affordability are not features we add later — they are the constraints we design within.')), body);
  }

  /* ---------- 07 Frameworks ---------- */
  function hypeSvg() {
    var segs = [[[40, 214], [90, 200], [120, 30], [160, 34]], [[160, 34], [200, 38], [220, 190], [268, 198]], [[268, 198], [320, 206], [350, 160], [400, 146]], [[400, 146], [460, 130], [520, 120], [615, 116]]];
    function at(i, tt) {
      var q = segs[i], u = 1 - tt;
      return [0, 1].map(function (k) { return u * u * u * q[0][k] + 3 * u * u * tt * q[1][k] + 3 * u * tt * tt * q[2][k] + tt * tt * tt * q[3][k]; });
    }
    var pts = [
      { p: at(0, 0.3), l: 'BHASHINI voice APIs', s: 'Innovation trigger', c: C.palette.saffron, dx: 12, dy: 18, a: 'start' },
      { p: at(0, 1), l: 'Generic “AI travel agents”', s: 'Peak of inflated expectations', c: '#9AA8BC', dx: 0, dy: -30, a: 'middle' },
      { p: at(1, 1), l: 'ONDC', s: 'Trough of disillusionment', c: '#9AA8BC', dx: 0, dy: 24, a: 'middle' },
      { p: at(2, 0.85), l: 'OneTrip pilot (target)', s: 'Slope of enlightenment', c: C.palette.blue, dx: 4, dy: -40, a: 'middle', big: true },
      { p: at(3, 0.75), l: 'UPI', s: 'Plateau of productivity', c: C.palette.navy, dx: 0, dy: -36, a: 'end' }
    ];
    var d = 'M' + segs[0][0].join(',') + segs.map(function (q) { return 'C' + q[1].join(',') + ' ' + q[2].join(',') + ' ' + q[3].join(','); }).join('');
    var s = '<svg class="diagram hype" viewBox="0 0 640 300" role="img" aria-labelledby="hy-t"><title id="hy-t">Gartner Hype Cycle with BHASHINI at the innovation trigger, OneTrip on the slope of enlightenment and UPI on the plateau</title>' +
      '<g transform="translate(0,34)"><line x1="30" y1="236" x2="620" y2="236" stroke="#C3CEDD"/><line x1="30" y1="-10" x2="30" y2="236" stroke="#C3CEDD"/>' +
      '<text x="20" y="120" font-size="12" fill="#5A6B82" text-anchor="middle" transform="rotate(-90 20 120)">Expectations</text><text x="620" y="254" font-size="12" fill="#5A6B82" text-anchor="end">Time →</text>' +
      '<path d="' + d + '" fill="none" stroke="#1C5FD4" stroke-width="2.5"/>';
    pts.forEach(function (o) {
      var x = o.p[0], y = o.p[1];
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (o.big ? 8 : 6) + '" fill="' + o.c + '" stroke="#fff" stroke-width="2"/>' +
        '<text x="' + (x + o.dx).toFixed(1) + '" y="' + (y + o.dy).toFixed(1) + '" font-size="12.5" font-weight="700" fill="#0B2C5F" text-anchor="' + o.a + '">' + esc(o.l) + '</text>' +
        '<text x="' + (x + o.dx).toFixed(1) + '" y="' + (y + o.dy + 14).toFixed(1) + '" font-size="11" fill="#5A6B82" text-anchor="' + o.a + '">' + esc(o.s) + '</text>';
    });
    return s + '</g></svg>';
  }
  function frameworks() {
    var utaut = [['Performance expectancy', 'Saves time and money: verified options, price comparison, arrival-gap fixes.'], ['Effort expectancy', 'Voice-first in 11 languages, 3-field search, sample trip — BHASHINI removes the text-literacy barrier.'], ['Social influence', 'Sourced ratings; “popular with families” chips; partner reviews in the traveller’s language.'], ['Facilitating conditions', 'Human escalation, station help desks and Yatra Saathi BC agents (like SBI YONO branches, BlackBuck hubs).']];
    var vrio = [['Valuable', 'Solves the #1 pain (coordination, 36.5%) at the moment of booking', 'Yes'], ['Rare', 'Only IRCTC holds the PNR-linked journey context for 82.68% of reserved bookings', 'Yes'], ['Inimitable', 'State trust + first-party journey data + escrow-backed refunds + DPI rails — not the code', 'Yes'], ['Organised', 'Existing catering, tourism and payment-gateway teams; partner ops + bank partnership', 'Building']];
    var body = '<div class="split-even">' +
      K.pane(t('ins.utaut', 'UTAUT: will travellers actually use it?'), esc(t('ins.utautSub', 'Socio-technical lens (Session 2)')), '<div class="table-wrap"><table class="vrio"><tbody>' + utaut.map(function (u) { return '<tr><th>' + esc(u[0]) + '</th><td>' + esc(u[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
      K.pane(t('ins.vrio', 'VRIO: why can’t MakeMyTrip copy this?'), esc(t('ins.vrioSub', 'The Copycat Test — the moat is data + trust + reach, not software')), '<div class="table-wrap"><table class="vrio"><tbody>' + vrio.map(function (v) { return '<tr><th>' + esc(v[0]) + '</th><td>' + esc(v[1]) + '</td><td class="yes">' + (v[2] === 'Yes' ? OT.icon('check', 14) + ' ' : '') + esc(v[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
      '</div>' +
      '<div style="margin-top:16px">' + K.pane(t('ins.hype', 'Hype Cycle: where each piece sits'), esc(t('ins.hypeSub', '“Never buy at the peak.” BHASHINI is early, so OneTrip labels weaker languages Beta and always falls back to text and humans.')), C.narrow() ?
        '<ol class="rules"><li><strong>BHASHINI voice APIs</strong> — innovation trigger</li><li><strong>Generic “AI travel agents”</strong> — peak of inflated expectations</li><li><strong>ONDC</strong> — trough of disillusionment</li><li><strong>OneTrip pilot (target)</strong> — slope of enlightenment</li><li><strong>UPI</strong> — plateau of productivity</li></ol>' : hypeSvg()) + '</div>' +
      '<div class="trio" style="margin-top:16px">' +
        K.pane(t('ins.sst', 'Sense · Seize · Transform'), esc(t('ins.sstSub', 'Dynamic capabilities — the Survival Test')), '<p class="small" style="margin:0"><strong>Sense</strong> Varanasi forward bookings +38% before Dev Deepawali. <strong>Seize</strong> onboard 12 ghat-side homestays with pre-approved bank credit. <strong>Transform</strong> launch a rail + stay package linked to a pilgrimage RD.</p><a class="btn btn-link small" href="#/admin/demand" style="margin-top:8px">' + esc(t('ins.seeDemand', 'See it on the Admin dashboard')) + ' →</a>') +
        K.pane(t('ins.platform', 'Pipe → platform'), esc(t('ins.platformSub', 'Value from orchestrating interactions, not owning assets')), '<p class="small" style="margin:0">Ticketing is a <strong>pipe</strong>: one product, one transaction. OneTrip is a <strong>multi-sided platform</strong>: travellers, partners, a bank and (labelled) advertisers, with governance (verification, refund owner, ranking rules) and a <strong>data flywheel</strong>. We avoid the classic mistake: “building technology and calling it a platform”.</p>') +
        K.pane(t('ins.agentic', 'AI+ not +AI, without AI washing'), esc(t('ins.agenticSub', 'Agentic patterns made visible')), '<p class="small" style="margin:0">An Orchestrator decomposes the task; Research, Verification, Itinerary and Recommendation agents use tools, reflect and re-plan; a human confirms every booking, payment and cancellation. Every step is shown in the Agent Trace — no “AI” badge without a mechanism.</p><a class="btn btn-link small" href="#/about" style="margin-top:8px">' + esc(t('ins.howWorks', 'How it works')) + ' →</a>') +
      '</div>' +
      '<div class="pane pane-navy" style="margin-top:16px"><h3>' + esc(t('ins.cheat', 'The 3-question cheat sheet')) + '</h3><div class="trio" style="margin-top:8px"><div><strong>Human Test</strong><p class="small" style="margin:4px 0 0">Will frontline people want it? Partner Agent drafts replies for small hotels; they approve.</p></div><div><strong>Copycat Test</strong><p class="small" style="margin:4px 0 0">Can a rival buy it tomorrow? Not the PNR context, state trust or escrow rails.</p></div><div><strong>Survival Test</strong><p class="small" style="margin:4px 0 0">Does it help us spot change? Demand Radar and Sense–Seize–Transform loops.</p></div></div></div>';
    return chap('frameworks', '07', t('ins.nav.frameworks', 'Course frameworks'), t('ins.frame.h', 'Through the lens of Business in the Digital Age'), '', body);
  }

  /* ---------- 08 Roadmap ---------- */
  function roadmap() {
    var st = [
      ['0–6 months', 'P0 · Rail-first coordinator', ['Post-booking OneTrip card + My Journey timeline', 'Station transfers, e-catering, trust info on every card', 'Hindi + English voice; 9 languages text', 'Escrow and UPI split settlement'], 'Gate: ticket KPIs unchanged; ≥ 10% card open rate', true],
      ['6–12 months', 'P1 · Hotels & partner side', ['Hotels within 2 km of 10 pilot stations', 'Partner console, Partner Agent, Demand Radar', 'Rewards card + Trip Shield (opt-in)', 'Complaints SLA and partner scorecards'], 'Gate: attach rate ≥ 5%; complaints < 4 / 1,000'],
      ['12–24 months', 'P2 · Full journey', ['Sightseeing and IRCTC packages', 'Voice in all 11 languages as BHASHINI matures', 'Smart POS, Growth Line pilots', 'Yatra Saathi assisted booking at stations'], 'Gate: CSAT ≥ 4.2 in every language'],
      ['24+ months', 'P3 · Open travel platform', ['ONDC-linked local partners', 'Account Aggregator-based partner credit', 'Traveller EMI and inclusion products, last', 'Pan-India rollout'], 'Gate: positive contribution after servicing and refunds']
    ];
    var body = '<div class="roadmap">' + st.map(function (s) {
      return '<div class="stn' + (s[4] ? ' now' : '') + '"><div class="when">' + esc(s[0]) + '</div><h4>' + esc(s[1]) + '</h4><ul>' + s[2].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><div class="gate-kpi">' + esc(s[3]) + '</div></div>';
    }).join('') + '</div><p class="small muted" style="margin-top:14px">' + esc(t('ins.roadNote', 'How far and how fast: each phase ships only when the previous gate is met — reliability and affordability before revenue.')) + '</p>';
    return chap('roadmap', '08', t('ins.nav.roadmap', 'Roadmap'), t('ins.road.h', 'Rail-first coordinator → full travel platform'), '', body);
  }

  /* ---------- render ---------- */
  var NAV = ['problem', 'evidence', 'personas', 'questions', 'revenue', 'guardrails', 'frameworks', 'roadmap'];
  var NAVL = { problem: 'Problem', evidence: 'Survey evidence', personas: 'Personas', questions: '5 case questions', revenue: 'Revenue model', guardrails: 'Social mandate', frameworks: 'Course frameworks', roadmap: 'Roadmap' };
  function render(el, params) {
    var root = document.createElement('div');
    el.appendChild(root);
    root.innerHTML = '<div class="ins-hero"><div class="container"><div class="eyebrow">IRCTC OneTrip · ' + esc(t('ins.eyebrow', 'Case 13 business case · SPJIMR Business in the Digital Age')) + '</div>' +
      '<h1>' + t('ins.hero.h', 'The ticket is the door, <em>not the whole journey.</em>') + '</h1>' +
      '<p class="lede">' + esc(t('ins.hero.lede', 'IRCTC owns the start of every rail trip, but travellers stitch together hotels, cabs, meals and sightseeing across separate apps. OneTrip turns a confirmed ticket into one trusted, multilingual journey — without slowing ticketing down.')) + '</p>' +
      '<div class="row-wrap" style="margin-top:6px"><a class="btn btn-accent" href="#/home">' + OT.icon('play', 16) + esc(t('ins.tryDemo', 'Try the traveller demo')) + '</a><a class="btn btn-ghost" href="#/about" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.35)">' + esc(t('ins.how', 'How the agents work')) + '</a></div>' +
      '<div class="case-strip"><div><b>82.68%</b><span>' + esc(t('ins.cs1', 'share of reserved ticket bookings')) + '</span></div><div><b>12.38 lakh</b><span>' + esc(t('ins.cs2', 'tickets per day (peak)')) + '</span></div><div><b>12.21 Cr+</b><span>' + esc(t('ins.cs3', 'app downloads')) + '</span></div><div><b class="hi">30.33%</b><span>' + esc(t('ins.cs4', 'of revenue from ticketing')) + '</span></div><div><b>45.60%</b><span>' + esc(t('ins.cs5', 'of revenue from catering')) + '</span></div></div>' +
      '<p class="xs" style="color:#9FB6DE;margin:0;padding-bottom:16px">' + esc(t('ins.caseSrc', 'Case 13 figures, as reported (period-specific).')) + '</p></div></div>' +
      '<nav class="ins-nav" aria-label="Business case sections"><div class="container">' + NAV.map(function (n, i) { return '<button type="button" data-goto="' + n + '"' + (i === 0 ? ' class="on"' : '') + '>' + esc(t('ins.nav.' + n, NAVL[n])) + '</button>'; }).join('') + '</div></nav>' +
      '<div class="container page" style="padding-top:0">' + problem() + evidence() + personas() + questions() + revenue() + guardrails() + frameworks() + roadmap() +
      '<div class="ins-foot">' + esc(t('ins.foot', 'Survey: N=52 convenience sample, 28–31 Oct 2026, weighted toward occasional travellers; stated intent, not conversion. Revenue figures are illustrative assumptions. Language/voice and all dashboard metrics on the Partner and Admin pages are simulated. Case facts from Case 13 (period-specific). Academic prototype; not affiliated with IRCTC.')) + '</div></div>';
    paintCalc(root);

    root.addEventListener('click', function (e) {
      var g = e.target.closest('[data-goto]');
      if (g) {
        var target = root.querySelector('#ch-' + g.getAttribute('data-goto'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      var sc = e.target.closest('[data-scen]');
      if (sc) {
        var name = sc.getAttribute('data-scen');
        var rows = S().illustrative_business_model.scenarios[name].per_100k_bookings;
        LINES.forEach(function (l, i) { calc.attach[l.key] = rows[i].attach_rate_pct; var inp = root.querySelector('#sl-' + l.key); if (inp) inp.value = calc.attach[l.key]; var o = root.querySelector('[data-out="' + l.key + '"]'); if (o) o.textContent = calc.attach[l.key] + '%'; });
        calc.takeAdj = 0; root.querySelector('#sl-take').value = 0; root.querySelector('[data-out="take"]').textContent = '0 pp';
        calc.tickets = 6; root.querySelector('#sl-tix').value = 6; root.querySelector('[data-out="tix"]').textContent = '6 lakh';
        OT.$$('[data-scen]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b === sc)); });
        paintCalc(root);
      }
    });
    root.addEventListener('input', function (e) {
      var tg = e.target;
      if (tg.hasAttribute('data-line')) { var k = tg.getAttribute('data-line'); calc.attach[k] = Number(tg.value); root.querySelector('[data-out="' + k + '"]').textContent = tg.value + '%'; }
      else if (tg.id === 'sl-take') { calc.takeAdj = Number(tg.value); root.querySelector('[data-out="take"]').textContent = (calc.takeAdj > 0 ? '+' : '') + calc.takeAdj + ' pp'; }
      else if (tg.id === 'sl-tix') { calc.tickets = Number(tg.value); root.querySelector('[data-out="tix"]').textContent = tg.value + ' lakh'; }
      else return;
      OT.$$('[data-scen]', root).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      paintCalc(root);
    });

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.getAttribute('data-chap');
          OT.$$('.ins-nav button', root).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-goto') === id); });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      OT.$$('[data-chap]', root).forEach(function (c) { observer.observe(c); });
    }
  }

  OT.registerView('insights', {
    title: function () { return t('ins.title', 'Business case'); },
    section: 'insights',
    render: render,
    onLeave: function () { if (observer) { observer.disconnect(); observer = null; } }
  });
})();
