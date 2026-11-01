/* IRCTC OneTrip — Home (v1.1): Step 1 train search (from/to/date/class/passengers), an intent-routing
 * "just say it" box (voice or text, any language: train / hotel / cab / status / refund), the station
 * name-board hero, "For you" personalised suggestions, PNR import and sample journeys. (Builder A)
 */
(function () {
  'use strict';
  var OT = window.OT;
  var D = function () { return OT.data.travel; };
  var timer = null, rec = null, root = null, navTimer = null;

  var ZONES = { NR: { en: 'Northern Railway', hi: 'उत्तर रेलवे' }, SR: { en: 'Southern Railway', hi: 'दक्षिण रेलवे' }, ECoR: { en: 'East Coast Railway', hi: 'पूर्व तट रेलवे' }, ER: { en: 'Eastern Railway', hi: 'पूर्व रेलवे' },
    CR: { en: 'Central Railway', hi: 'मध्य रेलवे' }, WR: { en: 'Western Railway', hi: 'पश्चिम रेलवे' }, NWR: { en: 'North Western Railway', hi: 'उत्तर पश्चिम रेलवे' }, NCR: { en: 'North Central Railway', hi: 'उत्तर मध्य रेलवे' },
    ECR: { en: 'East Central Railway', hi: 'पूर्व मध्य रेलवे' }, WCR: { en: 'West Central Railway', hi: 'पश्चिम मध्य रेलवे' }, SWR: { en: 'South Western Railway', hi: 'दक्षिण पश्चिम रेलवे' },
    SCR: { en: 'South Central Railway', hi: 'दक्षिण मध्य रेलवे' }, KR: { en: 'Konkan Railway', hi: 'कोंकण रेलवे' }, NFR: { en: 'Northeast Frontier Railway', hi: 'पूर्वोत्तर सीमांत रेलवे' } };
  var BOARD_ORDER = { CDG: ['hi', 'en', 'pa'], MDU: ['ta', 'en', 'hi'], PURI: ['or', 'en', 'hi'], CSMT: ['mr', 'en', 'hi'], MAS: ['ta', 'en', 'hi'], HWH: ['bn', 'en', 'hi'], SBC: ['kn', 'en', 'hi'],
    SC: ['te', 'en', 'hi'], ADI: ['gu', 'en', 'hi'], ASR: ['pa', 'en', 'hi'], TVC: ['ml', 'en', 'hi'], ERS: ['ml', 'en', 'hi'], BBS: ['or', 'en', 'hi'], PUNE: ['mr', 'en', 'hi'] };
  var PREFS = [
    { k: 'veg', key: 'pref.veg', en: 'Veg food' }, { k: 'nearStation', key: 'pref.near', en: 'Near station' },
    { k: 'freeCancel', key: 'pref.freeCancel', en: 'Free cancellation' }, { k: 'family', key: 'pref.family', en: 'Family' }, { k: 'temple', key: 'pref.temple', en: 'Temple visit' }
  ];
  var SAMPLE_EN = 'book from Chandigarh to Mumbai train';
  function t(k, fb, v) { return OT.t(k, fb, v); }
  function L() { return OT.i18n.lang(); }

  function boardScripts(code) {
    var first = BOARD_ORDER[code] || ['hi', 'en'];
    var s = D().stations[code];
    first = first.filter(function (c) { return s.names[c]; });
    var cur = L();
    var rest = OT.i18n.languages.map(function (l) { return l.code; }).filter(function (c) { return first.indexOf(c) < 0 && s.names[c]; });
    if (first.indexOf(cur) < 0 && s.names[cur]) { rest = rest.filter(function (c) { return c !== cur; }); rest.unshift(cur); }
    return first.concat(rest);
  }
  function boardHTML(code) {
    var s = D().stations[code];
    var z = ZONES[s.zone] || ZONES.NR;
    var first = boardScripts(code)[0];
    return '<div class="stn-board" role="img" aria-label="' + OT.esc(t('home.boardAria', 'Destination station board: {name}', { name: s.names.en })) + '">' +
      '<div class="board-plate">' +
      '<div class="board-top"><span class="board-code">' + OT.esc(code) + '</span><span class="board-zone">' + OT.esc(z.hi) + ' · ' + OT.esc(z.en) + '</span></div>' +
      '<div class="board-name-wrap"><div class="board-name" data-board-name lang="' + first + '">' + OT.esc(s.names[first] || s.names.en) + '</div></div>' +
      '<div class="board-rule"></div>' +
      '<div class="board-foot"><span data-board-lang>' + OT.esc(OT.lang ? OT.lang.info(first).native : first) + '</span><span class="board-dots" data-board-dots></span></div>' +
      '</div><div class="board-legs" aria-hidden="true"><span></span><span></span></div></div>';
  }
  function cycleBoard(code) {
    clearInterval(timer);
    var order = boardScripts(code), i = 0, s = D().stations[code];
    var dots = root && root.querySelector('[data-board-dots]');
    if (dots) dots.innerHTML = order.map(function (c, k) { return '<i class="' + (k === 0 ? 'on' : '') + '"></i>'; }).join('');
    timer = setInterval(function () {
      var el = root && root.querySelector('[data-board-name]');
      if (!el) { clearInterval(timer); return; }
      i = (i + 1) % order.length;
      el.classList.add('flip-out');
      setTimeout(function () {
        var c = order[i];
        el.textContent = s.names[c] || s.names.en;
        el.setAttribute('lang', c);
        el.classList.remove('flip-out');
        var lb = root && root.querySelector('[data-board-lang]');
        if (lb) lb.textContent = OT.lang ? OT.lang.info(c).native : c;
        OT.$$('[data-board-dots] i', root).forEach(function (d, k) { d.classList.toggle('on', k === i); });
      }, 260);
    }, 2300);
  }
  function setBoard(code) {
    var slot = root && root.querySelector('[data-board-slot]');
    if (!slot || !code || !D().stations[code]) return;
    if (slot.getAttribute('data-code') === code) return;
    slot.setAttribute('data-code', code);
    slot.innerHTML = boardHTML(code);
    cycleBoard(code);
  }

  function render(el, params) {
    root = el;
    var q = params.query || {};
    var u = OT.store.get('user') || {};
    var j = OT.store.get('journey');
    var stay = OT.state.stay || {};
    var from = q.from || u.homeCity || 'NDLS';
    var to = q.to || (j && j.train && j.train.to !== from ? j.train.to : (from === 'CDG' ? 'NDLS' : 'CDG'));
    if (!D().stations[to]) to = 'CDG';
    var budget = stay.budget || u.budget || (D().scenarios[to] ? D().scenarios[to].budget : 3000);
    var prefs = stay.prefs || u.prefs || (D().scenarios[to] ? D().scenarios[to].prefs : { nearStation: true });
    var draft = OT.state.homeDraft || '';
    var TR = OT.trains;

    el.innerHTML =
      '<section class="hero">' +
      '<div class="container hero-grid">' +
      '<div class="hero-copy">' +
      '<p class="kicker">' + OT.icon('train', 16) + ' <span>' + OT.esc(t('hero.kicker', 'Rail-first trip planner · 11 Indian languages')) + '</span></p>' +
      '<h1>' + OT.esc(t('hero.title2', 'Book your train. Then plan everything after it, in your language.')) + '</h1>' +
      '<p class="lead">' + OT.esc(t('hero.sub', 'Hotel, station cab, food and sightseeing, verified by AI agents and arranged around your train in one journey dashboard.')) + '</p>' +
      '<div class="row-wrap"><button type="button" class="btn btn-ghost btn-sm hero-demo" data-start-tour>' + OT.icon('play', 14) + OT.esc(t('home.demo', 'Start the 3-minute guided demo')) + '</button>' +
      (u.name ? '' : '<a class="btn btn-link small" href="#/login">' + OT.icon('user', 14) + ' ' + OT.esc(t('home.personas', 'Sign in as a demo persona')) + '</a>') + '</div>' +
      '<div class="board-slot" data-board-slot data-code="' + to + '">' + boardHTML(to) + '</div>' +
      '</div>' +
      '<div class="search-card card" id="trip-form">' +
      /* Step 1: trains */
      '<form id="train-form" class="train-form" novalidate data-tour="train-form">' +
      '<p class="step-label">' + OT.icon('train', 15) + ' ' + OT.esc(t('home.step1', 'Step 1 · Find trains')) + '</p>' +
      '<div class="tf-grid">' + TR.picker('tf-from', from, t('search.from', 'From')) +
      '<button type="button" class="icon-btn swap" id="tf-swap" aria-label="' + OT.esc(t('trn.swap', 'Swap stations')) + '">' + OT.icon('refresh', 16) + '</button>' +
      TR.picker('tf-to', to, t('search.to', 'To')) + '</div>' +
      '<div class="tf-grid2">' +
      '<div class="field"><label for="tf-date">' + OT.esc(t('search.date', 'Travel date')) + '</label><input id="tf-date" class="input" type="date" min="' + OT.data.rail.ymd(new Date()) + '" value="' + OT.esc(q.date || TR.tomorrow()) + '"></div>' +
      '<div class="field"><label for="tf-cls">' + OT.esc(t('trn.class', 'Class')) + '</label><select id="tf-cls" class="input"><option value="">' + OT.esc(t('trn.allCls', 'All classes')) + '</option>' +
      ['1A', '2A', '3A', '3E', 'SL', 'CC', 'EC'].map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="tf-pax">' + OT.esc(t('search.pax', 'Travellers')) + '</label><select id="tf-pax" class="input">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<option' + (n === (u.party ? u.party.length : 2) ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="form-error hidden" id="tf-err" role="alert"></div>' +
      '<button type="submit" class="btn btn-primary btn-lg btn-block" id="train-go">' + OT.icon('search', 18) + OT.esc(t('trn.search', 'Search trains')) + '</button>' +
      '</form>' +
      '<div class="or-rule"><span>' + OT.esc(t('home.orSay', 'or just say it, in any language')) + '</span></div>' +
      /* ask box */
      '<form class="ask voice-box" id="ask-form" data-tour="voice" novalidate>' +
      '<label class="label" for="ask-input">' + OT.esc(t('search.ask', 'Ask in your language')) + '</label>' +
      '<div class="ask-row">' +
      '<button type="button" class="icon-btn mic-btn" id="home-mic" aria-label="' + OT.esc(t('search.voice', 'Speak your query')) + '" title="' + OT.esc(t('search.voice', 'Speak your query')) + '">' + OT.icon('mic', 22) + '</button>' +
      '<textarea id="ask-input" class="input ask-input" rows="2" placeholder="' + OT.esc(t('home.askPh', 'e.g. “book from Chandigarh to Mumbai train on Friday” or “hotel near Chandigarh station under ₹3,000”')) + '">' + OT.esc(draft) + '</textarea>' +
      '<button type="submit" class="icon-btn send-btn" id="go-btn" aria-label="' + OT.esc(t('home.go', 'Go')) + '" title="' + OT.esc(t('home.go', 'Go')) + '">' + OT.icon('arrowRight', 20) + '</button>' +
      '</div>' +
      '<div class="voice-status" id="voice-status" aria-live="polite"></div>' +
      '<div class="translit hidden" id="translit"></div>' +
      '<div class="parse-preview" id="parse-preview" aria-live="polite"></div>' +
      '<div class="samples"><span class="xs muted">' + OT.esc(t('search.samplesLabel', 'No mic? Try a sample voice query:')) + '</span>' +
      '<button type="button" class="chip sample-chip" data-sample="hi">' + OT.icon('play', 12) + ' हिन्दी · ' + OT.esc(t('home.sampleHotel', 'hotel')) + '</button>' +
      '<button type="button" class="chip sample-chip" data-sample="en">' + OT.icon('play', 12) + ' English · ' + OT.esc(t('home.sampleTrain', 'train')) + '</button>' +
      '<button type="button" class="chip sample-chip" data-sample="ta">' + OT.icon('play', 12) + ' தமிழ் · ' + OT.esc(t('home.sampleHotel', 'hotel')) + '</button>' +
      '<button type="button" class="chip sample-chip" data-sample="bn">' + OT.icon('play', 12) + ' বাংলা · ' + OT.esc(t('home.sampleHotel', 'hotel')) + '</button>' +
      '</div>' +
      '<details class="stay-prefs"><summary class="small">' + OT.icon('hotel', 14) + ' ' + OT.esc(t('home.stayPrefs', 'Stay preferences (hotel budget, veg, family…)')) + '</summary>' +
      '<div class="field mt8"><label for="f-budget">' + OT.esc(t('search.budget', 'Hotel budget per night')) + '</label><div class="rupee-input"><span>₹</span><input id="f-budget" class="input" type="number" min="500" max="20000" step="100" value="' + budget + '" inputmode="numeric"></div></div>' +
      '<div class="chips mt8" id="f-prefs">' + PREFS.map(function (p) { return '<button type="button" class="chip" data-pref="' + p.k + '" aria-pressed="' + (prefs[p.k] ? 'true' : 'false') + '">' + OT.esc(t(p.key, p.en)) + '</button>'; }).join('') + '</div></details>' +
      '</form>' +
      '<div class="form-foot">' +
      '<button type="button" class="btn-link small" id="pnr-btn">' + OT.icon('train', 14) + ' ' + OT.esc(t('home.havePnr', 'I already have a ticket → import PNR (simulated)')) + '</button>' +
      '<a class="small" href="https://www.irctc.co.in/" target="_blank" rel="noopener">' + OT.esc(t('home.irctc', 'Continue to IRCTC ticketing')) + ' ↗</a>' +
      '</div></div>' +
      '</div>' +
      '<div class="track" aria-hidden="true"></div>' +
      '</section>' +
      '<div id="for-you-slot"></div>' +
      '<section class="container how" aria-labelledby="how-h">' +
      '<h2 id="how-h">' + OT.esc(t('how.title', 'How OneTrip works')) + '</h2>' +
      '<ol class="how-steps">' +
      [['train', 'how.0', 'Find and book your train', 'how.0d', 'Any route, any date: simulated timetable, fares and availability.'],
        ['mic', 'how.2', 'Speak or type your trip', 'how.2d', 'Source, destination, date and budget.'],
        ['shield', 'how.3', 'Agents research and verify', 'how.3d', 'Every price re-checked at source, with time stamps.'],
        ['hotel', 'how.4', 'Pick hotel, cab, food', 'how.4d', 'Compare prices, policies and ratings.'],
        ['route', 'how.5', 'Manage it in My Journey', 'how.5d', 'One timeline, readiness score, bookings and refunds.']]
        .map(function (s, i) { return '<li><span class="how-n">' + (i + 1) + '</span>' + OT.icon(s[0], 22) + '<strong>' + OT.esc(t(s[1], s[2])) + '</strong><span class="small muted">' + OT.esc(t(s[3], s[4])) + '</span></li>'; }).join('') +
      '</ol></section>' +
      '<section class="container scen" aria-labelledby="scen-h">' +
      '<div class="row between"><h2 id="scen-h">' + OT.esc(t('scen.title', 'Sample journeys')) + '</h2>' + OT.simTag() + '</div>' +
      '<div class="grid grid-3">' +
      ['CDG', 'MDU', 'PURI'].map(function (code) {
        var s2 = D().scenarios[code], tr = D().trains[s2.trainNo];
        return '<button type="button" class="scen-card card-flat" data-scen="' + code + '">' +
          '<span class="scen-lang">' + OT.esc(OT.lang.info(s2.lang).native) + '</span>' +
          '<strong>' + OT.esc(D().stationName(s2.from, L())) + ' → ' + OT.esc(D().stationName(code, L())) + '</strong>' +
          '<span class="small muted"><bdi class="keep">' + tr.no + '</bdi> ' + OT.esc(tr.name) + ' · <bdi class="keep">' + tr.dep + '</bdi>→<bdi class="keep">' + tr.arr + '</bdi></span>' +
          '<span class="small">' + OT.esc(t('scen.pax', '{n} travellers · budget {b}/night', { n: s2.passengers, b: OT.inr(s2.budget) })) + '</span>' +
          '</button>';
      }).join('') + '</div></section>';

    bind(el);
    cycleBoard(to);
    if (OT.forYou) OT.forYou.render(el.querySelector('#for-you-slot'), { place: 'home' });
    if (draft) preview(draft);
    if (q.voice === '1') setTimeout(function () { startVoice(); }, 150);
  }

  function status(html, kind) {
    var s = root && root.querySelector('#voice-status');
    if (!s) return;
    s.className = 'voice-status' + (kind ? ' vs-' + kind : '');
    s.innerHTML = html || '';
  }

  /** Live parse preview + sync the train form (shows what the agents understood). */
  function preview(text) {
    var box = root && root.querySelector('#parse-preview');
    if (!box) return null;
    if (!String(text || '').trim()) { box.innerHTML = ''; return null; }
    var det = OT.lang.detect(text), cmd = OT.agents.parseCommand(text), it = OT.agents.parseQuery(text);
    var budget = cmd.intent === 'hotel' ? it.budget : null;
    box.innerHTML = '<span class="xs muted">' + OT.esc(t('search.understood', 'Understood:')) + '</span> <span class="pp-chip pp-lang">' + OT.icon('globe', 12) + ' ' + OT.esc(OT.lang.info(det.code).native) + ' · ' + Math.round(det.confidence * 100) + '%</span>' +
      OT.trains.heardChips(cmd, { budget: budget }) + (cmd.intent === 'hotel' && cmd.to ? ' <bdi class="keep xs muted">' + cmd.to + '</bdi>' : '');
    if (cmd.from) OT.trains.setCode(root, 'tf-from', cmd.from);
    if (cmd.to) { OT.trains.setCode(root, 'tf-to', cmd.to); setBoard(cmd.to); }
    if (cmd.date) { var di = root.querySelector('#tf-date'); if (di) di.value = cmd.date; }
    if (cmd.cls) { var ci = root.querySelector('#tf-cls'); if (ci) ci.value = cmd.cls; }
    if (cmd.pax) { var pi = root.querySelector('#tf-pax'); if (pi) pi.value = String(cmd.pax); }
    if (budget) { var bi = root.querySelector('#f-budget'); if (bi) bi.value = budget; }
    if (it.nearStation) { var b = root.querySelector('[data-pref="nearStation"]'); if (b) b.setAttribute('aria-pressed', 'true'); }
    if (it.prefs.veg) { var v = root.querySelector('[data-pref="veg"]'); if (v) v.setAttribute('aria-pressed', 'true'); }
    var tl = root.querySelector('#translit');
    if (tl) {
      var lang = det.romanised ? 'hi' : (det.code === 'en' ? null : L());
      var r = lang && /[A-Za-z]{3,}/.test(text) ? OT.lang.transliterate(text, lang) : null;
      if (r && r.changed && r.text !== text) {
        tl.classList.remove('hidden');
        tl.innerHTML = OT.icon('edit', 14) + ' <span class="xs muted">' + OT.esc(t('search.translit', 'Transliteration:')) + '</span> <button type="button" class="btn-link" data-translit lang="' + lang + '">' + OT.esc(r.text) + '</button>';
        tl.querySelector('[data-translit]').addEventListener('click', function () {
          var ta = root.querySelector('#ask-input'); ta.value = r.text; OT.state.homeDraft = r.text; tl.classList.add('hidden'); preview(r.text);
        });
      } else { tl.classList.add('hidden'); tl.innerHTML = ''; }
    }
    return cmd;
  }

  function readStay() {
    var prefs = {};
    OT.$$('[data-pref]', root).forEach(function (b) { if (b.getAttribute('aria-pressed') === 'true') prefs[b.getAttribute('data-pref')] = true; });
    var budget = +(root.querySelector('#f-budget') || {}).value || 3000;
    OT.state.stay = { budget: budget, prefs: prefs };
    return OT.state.stay;
  }

  /** Route a spoken/typed command. Always answers visibly; never silent. Returns a Promise. */
  function handleCommand(text, opts) {
    opts = opts || {};
    if (!root) return Promise.resolve(null);
    text = String(text || '').trim();
    if (!text) { status(OT.icon('info', 14) + ' ' + OT.esc(t('cmd.empty', 'Type or say where you want to go, e.g. “train from Delhi to Jaipur on Friday”.')), 'warn'); return Promise.resolve(null); }
    var cmd = preview(text) || OT.agents.parseCommand(text);
    var heard = '<strong>' + OT.esc(t('cmd.heard', 'I heard')) + ':</strong> “' + OT.lang.highlight(text) + '”';
    var name = function (c) { return D().stationName(c, L()); };
    clearTimeout(navTimer);
    if (cmd.intent === 'train') {
      if (cmd.missing.length) {
        var miss = cmd.missing.indexOf('from') >= 0 && cmd.missing.indexOf('to') >= 0 ? t('cmd.missBoth', 'Which stations? Say “from Chandigarh to Mumbai” or pick From and To above.')
          : cmd.missing.indexOf('from') >= 0 ? t('cmd.missFrom', 'Train to {to}: from which station? Pick “From” above or say “from Chandigarh to {to}”.', { to: name(cmd.to) })
            : t('cmd.missTo', 'Train from {from}: where to? Pick “To” above or say the destination.', { from: name(cmd.from) });
        status(heard + '<br>' + OT.icon('info', 14) + ' ' + OT.esc(miss), 'warn');
        var f = root.querySelector(cmd.missing.indexOf('from') >= 0 ? '#tf-from' : '#tf-to'); if (f && !opts.noFocus) f.focus();
        return Promise.resolve(cmd);
      }
      var date = cmd.date || OT.trains.tomorrow();
      status(heard + '<br>' + OT.icon('train', 14) + ' ' + OT.esc(t('cmd.goTrains', 'Searching trains {from} → {to} on {date}…', { from: name(cmd.from), to: name(cmd.to), date: OT.fmtDate(date) })), 'ok');
      var path = OT.trains.path({ from: cmd.from, to: cmd.to, date: date, cls: cmd.cls || '', pax: cmd.pax || (root.querySelector('#tf-pax') || {}).value, heard: text });
      return new Promise(function (res) { navTimer = setTimeout(function () { OT.go(path); res(cmd); }, opts.delay != null ? opts.delay : 700); });
    }
    if (['hotel', 'cab', 'food', 'sight'].indexOf(cmd.intent) >= 0) {
      if (!cmd.to) { status(heard + '<br>' + OT.icon('info', 14) + ' ' + OT.esc(t('cmd.missCity', 'Which city? Say for example “hotel near Chandigarh station”.')), 'warn'); return Promise.resolve(cmd); }
      status(heard + '<br>' + OT.icon('search', 14) + ' ' + OT.esc(t('cmd.goStay', 'Asking the agents about {what} in {city}…', { what: t('tabs.' + cmd.intent, cmd.intent), city: name(cmd.to) })), 'ok');
      return planStay(cmd.to, text, cmd.intent).then(function () { return cmd; });
    }
    if (['refund', 'cancel', 'status', 'pnr', 'human'].indexOf(cmd.intent) >= 0 && OT.assistant) {
      status(heard + '<br>' + OT.icon('chat', 14) + ' ' + OT.esc(t('cmd.goAsst', 'Opening the assistant for that…')), 'ok');
      OT.assistant.open(); OT.assistant.ask(text, { intent: cmd.intent });
      return Promise.resolve(cmd);
    }
    status(heard + '<br>' + OT.icon('info', 14) + ' ' + OT.esc(t('cmd.unknownLong', 'I couldn’t tell where you want to go or what you need. Try “train from Delhi to Jaipur on Friday”, “hotel near Chandigarh station” or “where is my refund?”.')), 'warn');
    return Promise.resolve(cmd);
  }

  function planStay(to, text, intent) {
    var stay = readStay();
    var j = OT.store.get('journey');
    var it = OT.agents.parseQuery(text);
    var same = j && j.train && (j.scenario === to || j.train.to === to);
    var p = Promise.resolve(true);
    if (j && !same && (j.items || []).some(function (i) { return i.status !== 'cancelled'; })) {
      p = OT.confirmAction({
        title: t('search.replaceTitle', 'Start a new trip?'),
        lines: [OT.esc(t('search.replaceLine', 'Your current trip to {city} has {n} item(s). Starting a new trip keeps your bookings but replaces the plan.', {
          city: D().stationName(j.train.to, L()), n: j.items.filter(function (i) { return i.status !== 'cancelled'; }).length }))],
        confirmLabel: t('search.replaceOk', 'Start new trip')
      });
    }
    return p.then(function (ok) {
      if (!ok) return false;
      var budget = it.budget || stay.budget;
      if (same) OT.store.update('journey', function (cur) { cur.budget = budget; cur.prefs = Object.assign({}, cur.prefs, stay.prefs); return cur; });
      else {
        var nj = D().scenarios[to] ? D().makeJourney(to, { budget: budget, prefs: stay.prefs }) : D().plannedJourney(to, { budget: budget, prefs: stay.prefs });
        OT.store.set('journey', nj);
      }
      OT.state.homeDraft = text;
      OT.state.resTab = intent && intent !== 'hotel' ? intent : 'hotel';
      OT.go('results?to=' + encodeURIComponent(to) + (text ? '&q=' + encodeURIComponent(text) : ''));
      return true;
    });
  }

  function micBtn() { return root && root.querySelector('#home-mic'); }
  function startVoice() {
    if (!root) return;
    var ta = root.querySelector('#ask-input'), btn = micBtn();
    if (rec) { rec.stop(); rec = null; return; }
    var lang = L();
    status(OT.icon('mic', 14) + ' ' + OT.esc(t('voice.listening', 'Listening… speak in {lang}', { lang: OT.lang.info(lang).native })), 'live');
    if (btn) btn.classList.add('listening');
    rec = OT.lang.listen({
      lang: lang,
      onInterim: function (txt) { ta.value = txt; },
      onResult: function (txt, conf) {
        ta.value = txt; OT.state.homeDraft = txt;
        status(OT.icon('checkCircle', 14) + ' ' + OT.esc(t('voice.heard', 'Transcribed (ASR confidence {c}%)', { c: Math.round(conf * 100) })), 'ok');
        handleCommand(txt);
      },
      onError: function (e) {
        status(OT.icon('info', 14) + ' ' + OT.esc(e.message) + ' <button type="button" class="btn-link" data-sample-inline="' + (OT.lang.samples[lang] ? lang : 'hi') + '">' + OT.esc(t('voice.trySample', 'Try a sample voice query')) + '</button>', 'warn');
        var sb = root.querySelector('[data-sample-inline]');
        if (sb) sb.addEventListener('click', function () { sample(sb.getAttribute('data-sample-inline')); });
      },
      onEnd: function () { rec = null; if (btn) btn.classList.remove('listening'); }
    });
    if (!rec && btn) btn.classList.remove('listening');
  }

  /** Scripted sample voice query, typed out as if transcribed (hi = the brief's hotel sentence, en = train). */
  function sample(lang, text) {
    if (!root) return Promise.resolve();
    var ta = root.querySelector('#ask-input'), btn = micBtn();
    text = text || (lang === 'en' ? SAMPLE_EN : (OT.lang.samples[lang] || OT.lang.samples.hi));
    if (btn) btn.classList.add('listening');
    status(OT.icon('mic', 14) + ' ' + OT.esc(t('voice.simulating', 'Sample voice query (simulated ASR, {lang})…', { lang: OT.lang.info(lang).native })), 'live');
    ta.value = '';
    return OT.lang.simulateVoice(text, {
      wordMs: 110,
      onInterim: function (s) { ta.value = s; },
      onResult: function (s, c) {
        if (!root) return;
        ta.value = s; OT.state.homeDraft = s;
        if (btn) btn.classList.remove('listening');
        status(OT.icon('checkCircle', 14) + ' ' + OT.esc(t('voice.heardSim', 'Transcribed by simulated ASR (confidence {c}%)', { c: Math.round(c * 100) })), 'ok');
        preview(s);
      }
    });
  }

  function submitTrains() {
    var f = OT.trains.codeOf(root, 'tf-from'), to = OT.trains.codeOf(root, 'tf-to'), date = root.querySelector('#tf-date').value, err = root.querySelector('#tf-err');
    var msg = !f || !to ? t('trn.errPick', 'Pick a From and a To station from the list.') : f === to ? t('trn.errSame', 'From and To must be different stations.') : !date ? t('search.noDate', 'Please choose a travel date.') : OT.data.rail.daysTo(date) < 0 ? t('trn.errPast', 'That date is in the past. Pick today or a later date.') : '';
    if (msg) { err.textContent = msg; err.classList.remove('hidden'); return false; }
    err.classList.add('hidden');
    readStay();
    OT.go(OT.trains.path({ from: f, to: to, date: date, cls: root.querySelector('#tf-cls').value, pax: root.querySelector('#tf-pax').value }));
    return true;
  }

  function pnrModal() {
    OT.modal({
      title: t('pnr.title', 'Import train from PNR (simulated)'),
      body: '<p class="small muted">' + OT.esc(t('pnr.note', 'No live PNR lookup. Only these sample PNRs exist in the demo data:')) + '</p>' +
        '<ul class="pnr-samples">' + ['CDG', 'MDU', 'PURI'].map(function (c) { var s = D().scenarios[c]; return '<li><button type="button" class="btn-link" data-pnr="' + s.pnr + '"><bdi class="keep">' + s.pnr + '</bdi></button> · ' + OT.esc(D().stationName(s.from, L())) + ' → ' + OT.esc(D().stationName(c, L())) + '</li>'; }).join('') + '</ul>' +
        '<div class="field"><label for="pnr-in">' + OT.esc(t('pnr.label', '10-digit PNR')) + '</label><input id="pnr-in" class="input mono-num" inputmode="numeric" maxlength="10" value="4521837690"></div>' +
        '<p class="small" id="pnr-msg" aria-live="polite"></p>',
      onOpen: function (body) { OT.$$('[data-pnr]', body).forEach(function (b) { b.addEventListener('click', function () { body.querySelector('#pnr-in').value = b.getAttribute('data-pnr'); }); }); },
      actions: [
        { label: t('common.cancel', 'Cancel'), kind: 'ghost' },
        { label: t('pnr.fetch', 'Fetch (simulated)'), kind: 'primary', onClick: function (close) {
          var inp = document.getElementById('pnr-in'), msg = document.getElementById('pnr-msg');
          var v = inp.value.trim();
          if (!/^\d{10}$/.test(v)) { msg.textContent = t('pnr.bad', 'Enter a 10-digit PNR.'); msg.className = 'small text-bad'; return; }
          var sc = D().findPnr(v);
          var b = (OT.store.get('bookings', []) || []).filter(function (x) { return x.type === 'train' && x.pnr === v; })[0];
          if (!sc && !b) { msg.textContent = t('pnr.notFound', 'PNR not found in the sample data. Try 4521837690.'); msg.className = 'small text-bad'; return; }
          msg.textContent = t('pnr.loading', 'Reading sample PNR…'); msg.className = 'small muted';
          OT.sleep(600).then(function () {
            var j = b ? D().journeyFromTicket(b.ticket) : D().makeJourney(sc.key, {});
            OT.store.set('journey', j);
            close();
            OT.toast(t('pnr.ok', 'Train {no} imported: {from} → {to} (sample)', { no: j.train.no, from: j.train.from, to: j.train.to }), 'success');
            OT.go('journey');
          });
        } }
      ]
    });
  }

  function bind(el) {
    var ta = el.querySelector('#ask-input');
    OT.trains.bindPicker(el, 'tf-from');
    OT.trains.bindPicker(el, 'tf-to', function (code) { setBoard(code); });
    el.querySelector('#tf-swap').addEventListener('click', function () { var a = OT.trains.codeOf(el, 'tf-from'), b = OT.trains.codeOf(el, 'tf-to'); OT.trains.setCode(el, 'tf-from', b); OT.trains.setCode(el, 'tf-to', a); setBoard(a); });
    el.querySelector('#train-form').addEventListener('submit', function (e) { e.preventDefault(); submitTrains(); });
    el.querySelector('#ask-form').addEventListener('submit', function (e) { e.preventDefault(); handleCommand(ta.value); });
    ta.addEventListener('input', OT.debounce(function () { OT.state.homeDraft = ta.value; preview(ta.value); }, 250));
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommand(ta.value); } });
    el.querySelector('#home-mic').addEventListener('click', startVoice);
    OT.$$('[data-sample]', el).forEach(function (b) { b.addEventListener('click', function () { sample(b.getAttribute('data-sample')); }); });
    OT.$$('[data-pref]', el).forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); readStay(); }); });
    var fb = el.querySelector('#f-budget'); if (fb) fb.addEventListener('change', readStay);
    el.querySelector('#pnr-btn').addEventListener('click', pnrModal);
    var sd = el.querySelector('[data-start-tour]'); if (sd) sd.addEventListener('click', function () { if (OT.tour) OT.tour.start(); });
    OT.$$('[data-scen]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-scen'), sc = D().scenarios[code];
        OT.trains.setCode(el, 'tf-from', sc.from); OT.trains.setCode(el, 'tf-to', code);
        el.querySelector('#tf-pax').value = String(sc.passengers);
        el.querySelector('#f-budget').value = sc.budget;
        OT.$$('[data-pref]', el).forEach(function (p) { p.setAttribute('aria-pressed', sc.prefs[p.getAttribute('data-pref')] ? 'true' : 'false'); });
        ta.value = ''; OT.state.homeDraft = ''; preview('');
        setBoard(code);
        el.querySelector('#trip-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  OT.registerView('home', {
    title: function () { return OT.t('nav.plan', 'Plan trip'); },
    section: 'home',
    render: render,
    onLeave: function () { clearInterval(timer); clearTimeout(navTimer); if (rec) { rec.stop(); rec = null; } if (OT.lang) OT.lang.stopListening(); root = null; },
    startVoice: startVoice,
    sample: sample,
    command: handleCommand,
    /** v1 compatibility: submit the ask box (tour/tests). */
    submit: function () { return root ? handleCommand(root.querySelector('#ask-input').value, { delay: 0 }) : Promise.resolve(null); }
  });
})();
