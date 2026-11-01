/* IRCTC OneTrip — How it works (#/about) — Builder B.
 * Agent architecture, BHASHINI pipeline, data & verification rules, what is simulated vs real,
 * tech stack and privacy (DPDP Act, 2023).
 */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;
  var K = OT.dashkit, C = OT.charts;
  var t = K.t;

  if (OT.i18n && OT.i18n.extend) {
    OT.i18n.extend({ hi: {
      'about.title': 'यह कैसे काम करता है',
      'about.h': 'OneTrip कैसे काम करता है',
      'about.agents': 'एजेंट आर्किटेक्चर',
      'about.pipeline': 'BHASHINI भाषा पाइपलाइन',
      'about.rules': 'डेटा और सत्यापन नियम',
      'about.simReal': 'क्या सिम्युलेटेड है, क्या असली',
      'about.privacy': 'गोपनीयता (DPDP अधिनियम, 2023)'
    } });
  }

  function box(x, y, w, h, title, sub, o) {
    o = o || {};
    var fill = o.fill || '#fff', stroke = o.stroke || '#1C5FD4', tc = o.tc || '#0B2C5F', sc = o.sc || '#3A4A60';
    return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + '/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + (sub ? h / 2 - 3 : h / 2 + 5)) + '" text-anchor="middle" font-size="' + (o.fs || 14) + '" font-weight="700" fill="' + tc + '">' + esc(title) + '</text>' +
      (sub ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 14) + '" text-anchor="middle" font-size="11.5" fill="' + sc + '">' + esc(sub) + '</text>' : '') + '</g>';
  }
  function arrow(x1, y1, x2, y2, col) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (col || '#5A6B82') + '" stroke-width="1.6" marker-end="url(#ab-a)"/>';
  }
  function archSvg() {
    var W = 900;
    var s = '<svg class="diagram" viewBox="0 0 ' + W + ' 600" role="img" aria-labelledby="arch-t"><title id="arch-t">Agent architecture: traveller to Multilingual agent to Orchestrator, which dispatches five specialist agents; all results pass the independent Verification gate, are translated back and need human confirmation before any booking, payment or cancellation</title>' +
      '<defs><marker id="ab-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#5A6B82"/></marker></defs>';
    s += box(300, 10, 300, 50, 'Traveller', 'voice or text · any of 11 languages', { fill: '#FFF3E6', stroke: '#E0761A' });
    s += arrow(450, 60, 450, 84);
    s += box(240, 86, 420, 54, 'Multilingual Agent (in)', 'BHASHINI ASR · detect language · NMT → English · protect tokens');
    s += arrow(450, 140, 450, 164);
    s += box(300, 166, 300, 58, 'Orchestrator', 'plan → assign tasks → merge → re-plan', { fill: '#0B2C5F', stroke: '#0B2C5F', tc: '#fff', sc: '#C8D6EE', fs: 15 });
    var workers = [['Research', 'options + source + time'], ['Recommendation', 'ranks by budget, prefs'], ['Itinerary', 'chronological plan, conflicts'], ['Customer Support', 'policy-grounded answers'], ['Partner', 'listings, enquiry drafts']];
    var ww = 166, gap = 10, x0 = (W - (ww * 5 + gap * 4)) / 2;
    workers.forEach(function (w, i) {
      var x = x0 + i * (ww + gap);
      s += '<path d="M450,224 C450,250 ' + (x + ww / 2) + ',236 ' + (x + ww / 2) + ',262" fill="none" stroke="#5A6B82" stroke-width="1.4" marker-end="url(#ab-a)"/>';
      s += box(x, 264, ww, 56, w[0], w[1], { fs: 13.5 });
      s += arrow(x + ww / 2, 320, x + ww / 2, 352);
    });
    s += '<rect x="' + (x0 - 6) + '" y="354" width="' + (ww * 5 + gap * 4 + 12) + '" height="58" rx="10" fill="#E6F5EF" stroke="#12805C" stroke-width="2"/>' +
      '<text x="450" y="378" text-anchor="middle" font-size="14.5" font-weight="800" fill="#12805C">Verification Agent — independent gate</text>' +
      '<text x="450" y="398" text-anchor="middle" font-size="11.5" fill="#1E2A3B">re-checks price, availability, timing, rating and policy against the original source · flags stale, missing or contradictory data</text>';
    s += arrow(450, 412, 450, 436);
    s += box(240, 438, 420, 50, 'Multilingual Agent (out)', 'NMT back to your language · TTS read-aloud · original kept');
    s += arrow(450, 488, 450, 512);
    s += box(250, 514, 400, 56, 'Human-in-the-loop', 'you confirm every booking, payment and cancellation', { fill: '#FFF3E6', stroke: '#E0761A', fs: 14.5 });
    // side notes (data sources and optional LLM) — kept clear of the dispatch curves
    s += '<g><rect x="12" y="92" width="210" height="74" rx="10" fill="#fff" stroke="#9AA8BC" stroke-dasharray="5 4" stroke-width="1.5"/>' +
      '<text x="117" y="114" text-anchor="middle" font-size="13" font-weight="700" fill="#0B2C5F">Provider sources</text>' +
      '<text x="117" y="132" text-anchor="middle" font-size="11" fill="#3A4A60">simulated catalogue + train data</text>' +
      '<text x="117" y="150" text-anchor="middle" font-size="11" fill="#5A6B82">source of truth for prices &amp; times</text></g>';
    s += '<g><rect x="678" y="92" width="210" height="74" rx="10" fill="#fff" stroke="#9AA8BC" stroke-dasharray="5 4" stroke-width="1.5"/>' +
      '<text x="783" y="114" text-anchor="middle" font-size="13" font-weight="700" fill="#0B2C5F">Gemini (optional)</text>' +
      '<text x="783" y="132" text-anchor="middle" font-size="11" fill="#3A4A60">language &amp; phrasing only</text>' +
      '<text x="783" y="150" text-anchor="middle" font-size="11" fill="#5A6B82">never invents prices; rules if offline</text></g>';
    s += '<path d="M117,166 L117,250" fill="none" stroke="#9AA8BC" stroke-dasharray="4 4" stroke-width="1.4" marker-end="url(#ab-a)"/>';
    s += '<path d="M783,166 L783,195 L602,195" fill="none" stroke="#9AA8BC" stroke-dasharray="4 4" stroke-width="1.4" marker-end="url(#ab-a)"/>';
    return s + '</svg>';
  }
  function archList() {
    return '<ol class="rules"><li><strong>Traveller</strong> speaks or types in any of 11 languages.</li><li><strong>Multilingual Agent</strong> (BHASHINI ASR, language detection, NMT to English) protects PNR, train no., ₹, dates and station codes.</li><li><strong>Orchestrator</strong> plans and assigns tasks, merges results and re-plans when something fails.</li><li><strong>Specialists</strong>: Research (with source + checked time), Recommendation, Itinerary, Customer Support, Partner.</li><li><strong>Verification Agent</strong> is an independent gate: re-checks every fact against its source and flags stale, missing or contradictory data.</li><li><strong>Multilingual Agent</strong> translates back and reads aloud (TTS); the original is kept.</li><li><strong>Human-in-the-loop</strong>: you confirm every booking, payment and cancellation.</li></ol>';
  }

  function render(el) {
    var root = document.createElement('div');
    el.appendChild(root);
    var agents = [
      ['Orchestrator', 'Decomposes the request into a plan, assigns tasks, merges results, re-plans after a verification flag', 'Task planner, agent registry', 'Low — proposes only'],
      ['Multilingual', 'Detects language, translates in and out, transliteration, voice in/out; keeps protected tokens unchanged', 'BHASHINI ASR / NMT / TTS (simulated), Web Speech API', 'Low — low-confidence goes to original text or a human'],
      ['Research', 'Looks up hotels, cabs, meals and sights in approved provider data; records source and checked-at time', 'Provider catalogue / partner APIs (simulated)', 'Read-only'],
      ['Verification', 'Independently re-checks price, availability, timing, rating, location and cancellation policy; marks Verified / Needs confirmation / Unavailable', 'Second source, staleness rule (> 6 h)', 'Can block, never invent'],
      ['Recommendation', 'Ranks verified options by budget, distance, preferences; explains “Why this?”; labels Sponsored', 'Ranking rules', 'Suggests; you choose'],
      ['Itinerary', 'Builds the chronological plan around the train; flags conflicts such as 11:05 arrival vs 14:00 check-in', 'Train timings, check-in times, transfer durations', 'Suggests fixes'],
      ['Customer Support', 'Answers booking, cancellation and refund questions grounded in policy text; escalates to a human with a ticket', 'Policy retrieval, booking lookup', 'Proposes actions; you confirm'],
      ['Partner', 'Helps partners keep listings complete and drafts enquiry replies in the traveller’s language', 'Listings, enquiries, policies', 'Drafts only; partner sends']
    ];
    var simReal = [
      ['Trains, PNR, timings', 'Sample journey (e.g. 12011 NDLS → CDG)', 'Live IRCTC booking / running-status APIs'],
      ['Hotels, cabs, meals, sights', 'Simulated catalogue with sources and timestamps', 'Partner extranets / provider APIs'],
      ['Payments & refunds', 'Simulated UPI / card, no real details collected', 'Bank gateway, escrow, T+1 settlement'],
      ['Language: ASR, NMT, TTS', 'Browser Web Speech API where supported + built-in translations; BHASHINI labelled simulated', 'BHASHINI APIs after registration and approval'],
      ['AI reasoning', 'Deterministic agent rules; optional Gemini for language understanding and phrasing (your own key)', 'Production LLM with evaluation and monitoring'],
      ['Partner & admin dashboards', 'Simulated pilot data (10 destinations, 12 weeks) + bookings you make in this browser', 'Platform data warehouse'],
      ['Customer survey (Business case)', 'REAL: 52 responses, 28–31 Oct 2026', '—'],
      ['Case facts (82.68% share etc.)', 'REAL: quoted from Case 13 (period-specific)', '—']
    ];
    var rules = [
      'Agents never invent prices, availability, ratings or train timings — they only pick from source data.',
      'Every price, availability, rating and policy carries its source and the time it was checked.',
      'The Verification Agent re-checks each fact independently before it is shown. Older than 6 h → “Needs confirmation”; missing → “Unavailable”; two sources disagree → both shown.',
      'BHASHINI is the language layer only — never the source of truth for rail, hotel, cab or booking data.',
      'PNR, train numbers, station codes, dates, prices and booking references are never translated.',
      'Cancellation, refund and payment text is verified after translation; the original is always one tap away; low confidence routes to a human.',
      'Book, pay and cancel always need your explicit confirmation (human-in-the-loop).',
      'Recommendations are optional and dismissible; at most one card per journey stage; sponsored items are labelled.'
    ];
    var langs = (OT.i18n && OT.i18n.languages) || [];
    root.innerHTML = '<div class="container page">' +
      '<div class="page-head"><div><div class="eyebrow">' + esc(t('about.eyebrow', 'Under the hood')) + '</div><h1>' + esc(t('about.h', 'How OneTrip works')) + '</h1><p>' + esc(t('about.sub', 'An agentic workflow you can inspect: every AI step, source and check is visible, and you stay in control of every action.')) + '</p></div>' +
      '<div class="row-wrap"><a class="btn btn-ghost" href="#/insights">' + esc(t('about.toCase', 'Business case')) + '</a><a class="btn btn-primary" href="#/home">' + OT.icon('play', 16) + esc(t('about.try', 'Try it')) + '</a></div></div>' +
      K.sec(t('about.agents', 'Agent architecture'), esc(t('about.agentsSub', 'An Orchestrator coordinates seven specialist agents. Verification is an independent gate, and a human confirms every action.')), K.pane('', '', C.narrow() ? archList() : archSvg())) +
      '<div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>' + esc(t('about.agent', 'Agent')) + '</th><th>' + esc(t('about.does', 'What it does')) + '</th><th>' + esc(t('about.tools', 'Tools / data')) + '</th><th>' + esc(t('about.autonomy', 'Degree of autonomy')) + '</th></tr></thead><tbody>' +
        agents.map(function (a) { return '<tr><td><strong>' + esc(a[0]) + '</strong></td><td>' + esc(a[1]) + '</td><td>' + esc(a[2]) + '</td><td>' + esc(a[3]) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      K.sec(t('about.pipeline', 'BHASHINI language pipeline'), esc(t('about.pipelineSub', 'Simulated in this prototype; built to the BHASHINI task names so it can be swapped for the real APIs after approval.')),
        '<div class="pipeline">' + [['1 · ASR', 'Speech → text', 'Hindi voice query transcribed'], ['2 · Detect', 'Language ID', 'hi-IN, confidence shown'], ['3 · NMT in', 'Hindi → English', 'protected tokens masked'], ['Agents', 'Plan · research · verify', 'English working language', true], ['4 · NMT out', 'English → Hindi', 'policy text verified'], ['5 · TTS', 'Text → speech', 'read aloud on 🔊']].map(function (p) {
          return '<div class="pipe-step' + (p[3] ? ' core' : '') + '"><div class="eyebrow">' + esc(p[0]) + '</div><strong>' + esc(p[1]) + '</strong><p>' + esc(p[2]) + '</p></div>';
        }).join('') + '</div>' +
        '<div class="pane" style="margin-top:12px"><p style="margin:0 0 6px"><span class="lang-chip">HI</span> <span lang="hi">मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए।</span></p>' +
        '<p class="small muted" style="margin:0 0 6px">' + esc(t('about.tokens', 'Protected tokens pass through translation unchanged:')) + ' <span class="token">₹3,000</span><span class="token">CDG</span><span class="token">12011</span><span class="token">4521837690</span><span class="token">14 Nov 2026</span><span class="token">11:05</span></p>' +
        '<p class="small" style="margin:0">' + esc(t('about.langNote', 'Coverage: the full interface is translated into English and Hindi. For Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi and Odia, the header, search, journey timeline, status labels and assistant are translated; any remaining text falls back to English, and the app says so when a voice feature is unavailable in a language.')) + (langs.length ? ' (' + langs.length + ' ' + esc(t('about.langsLoaded', 'languages loaded')) + ')' : '') + '</p></div>') +
      K.sec(t('about.rules', 'Data & verification rules'), '', '<div class="split"><div class="pane"><ol class="rules">' + rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ol></div>' +
        '<div class="pane pane-wash"><h3>' + esc(t('about.badges', 'What the badges mean')) + '</h3><div class="stack">' +
        '<div>' + OT.badge('verified') + '<p class="small" style="margin:4px 0 0">' + esc(t('about.b1', 'Matched in the source within the last 6 hours.')) + '</p></div>' +
        '<div>' + OT.badge('confirm') + '<p class="small" style="margin:4px 0 0">' + esc(t('about.b2', 'Stale, or two sources disagree — confirm with the provider.')) + '</p></div>' +
        '<div>' + OT.badge('unavailable') + '<p class="small" style="margin:4px 0 0">' + esc(t('about.b3', 'Missing in the source — we show “Unavailable”, never a guess.')) + '</p></div>' +
        '<div>' + OT.badge('simulated') + '<p class="small" style="margin:4px 0 0">' + esc(t('about.b4', 'Demonstration data in this academic prototype.')) + '</p></div></div></div></div>') +
      K.sec(t('about.simReal', 'What is simulated, what is real'), esc(t('about.simRealSub', 'We do not claim any live IRCTC, BHASHINI or bank integration.')),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('about.component', 'Component')) + '</th><th>' + esc(t('about.inProto', 'In this prototype')) + '</th><th>' + esc(t('about.inProd', 'In production')) + '</th></tr></thead><tbody>' +
        simReal.map(function (r) { var real = /^REAL/.test(r[1]); return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td>' + (real ? '<span class="badge b-ok">' + OT.icon('checkCircle', 13) + 'Real</span> ' + esc(r[1].replace(/^REAL:\s*/, '')) : OT.simTag() + ' ' + esc(r[1])) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
      '<div class="split-even" style="margin-top:30px">' +
        K.pane(t('about.tech', 'Tech stack'), '', '<ul class="small" style="margin:0;padding-left:18px"><li>Static HTML, CSS and JavaScript — no build step, no frameworks, no CDN scripts; opens by double-clicking <code>index.html</code> or via any static server.</li><li>Hand-built SVG charts and diagrams (no chart library).</li><li>Web Speech API for speech recognition and read-aloud where the browser supports it (best in Chrome / Edge).</li><li>Optional Google Gemini for language understanding — your key stays in this browser (Settings).</li><li>State saved in this browser’s localStorage; “Reset demo data” clears it.</li></ul>') +
        K.pane(t('about.privacy', 'Privacy (DPDP Act, 2023)'), '', '<ul class="small" style="margin:0;padding-left:18px"><li>Consent first, purpose-limited, minimum data; consent can be withdrawn at any time.</li><li>Partners see only what fulfilment needs and aggregated insights (cohorts under 50 hidden).</li><li>The bank sees payment data only — never the full itinerary by default.</li><li>Rights to access, correct and erase; grievance officer; data stored in India; time-limited retention.</li><li>This prototype collects no real personal, payment or ID data and sends nothing to any server, except optional Gemini calls you enable.</li></ul>', 'pane-wash') +
      '</div></div>';
  }

  OT.registerView('about', {
    title: function () { return t('about.title', 'How it works'); },
    section: 'insights',
    render: render
  });
})();
