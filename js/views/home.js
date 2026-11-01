/* IRCTC OneTrip — Home: station name-board hero, journey search (text + voice), PNR import. (Builder A) */
(function () {
  'use strict';
  var OT = window.OT;
  var D = function () { return OT.data.travel; };
  var timer = null, rec = null, root = null;

  var ZONES = { NR: { en: 'Northern Railway', hi: 'उत्तर रेलवे' }, SR: { en: 'Southern Railway', hi: 'दक्षिण रेलवे' }, ECoR: { en: 'East Coast Railway', hi: 'पूर्व तट रेलवे' }, ER: { en: 'Eastern Railway', hi: 'पूर्व रेलवे' } };
  var BOARD_ORDER = { CDG: ['hi', 'en', 'pa'], MDU: ['ta', 'en', 'hi'], PURI: ['or', 'en', 'hi'] };
  var PREFS = [
    { k: 'veg', key: 'pref.veg', en: 'Veg food' },
    { k: 'nearStation', key: 'pref.near', en: 'Near station' },
    { k: 'freeCancel', key: 'pref.freeCancel', en: 'Free cancellation' },
    { k: 'family', key: 'pref.family', en: 'Family' },
    { k: 'temple', key: 'pref.temple', en: 'Temple visit' }
  ];

  function boardScripts(code) {
    var first = BOARD_ORDER[code] || ['en', 'hi'];
    var cur = OT.i18n.lang();
    var rest = OT.i18n.languages.map(function (l) { return l.code; }).filter(function (c) { return first.indexOf(c) < 0; });
    if (first.indexOf(cur) < 0) { rest = rest.filter(function (c) { return c !== cur; }); rest.unshift(cur); }
    return first.concat(rest);
  }

  function boardHTML(code) {
    var s = D().stations[code];
    var z = ZONES[s.zone] || ZONES.NR;
    var first = boardScripts(code)[0];
    return '<div class="board" role="img" aria-label="' + OT.esc(OT.t('home.boardAria', 'Destination station board: {name}', { name: s.names.en })) + '">' +
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

  function opt(code, sel, list) {
    return list.map(function (c) {
      return '<option value="' + c + '"' + (c === sel ? ' selected' : '') + '>' + OT.esc(D().stationName(c, OT.i18n.lang())) + ' (' + c + ')</option>';
    }).join('');
  }

  function render(el, params) {
    root = el;
    var q = params.query || {};
    var j = OT.store.get('journey');
    var to = q.to || (j && j.scenario) || 'CDG';
    if (!D().scenarios[to]) to = 'CDG';
    var sc = D().scenarios[to];
    var prefs = (j && j.scenario === to && j.prefs) || sc.prefs;
    var date = (j && j.scenario === to && j.train.date) || D().defaultDate();
    var pax = (j && j.scenario === to && j.passengers) || sc.passengers;
    var budget = (j && j.scenario === to && j.budget) || sc.budget;
    var st = OT.state.homeDraft || '';
    var t = OT.t;

    el.innerHTML =
      '<section class="hero">' +
      '<div class="container hero-grid">' +
      '<div class="hero-copy">' +
      '<p class="kicker">' + OT.icon('train', 16) + ' <span>' + OT.esc(t('hero.kicker', 'Rail-first trip planner · 11 Indian languages')) + '</span></p>' +
      '<h1>' + OT.esc(t('hero.title', 'Your train is booked. Plan everything after it, in your language.')) + '</h1>' +
      '<p class="lead">' + OT.esc(t('hero.sub', 'Hotel, station cab, food and sightseeing, verified by AI agents and arranged around your train in one journey dashboard.')) + '</p>' +
      '<div class="board-slot" data-board-slot>' + boardHTML(to) + '</div>' +
      '</div>' +
      '<form class="search-card card" id="trip-form" novalidate>' +
      '<div class="ask voice-box" data-tour="voice">' +
      '<label class="label" for="ask-input">' + OT.esc(t('search.ask', 'Ask in your language')) + '</label>' +
      '<div class="ask-row">' +
      '<button type="button" class="icon-btn mic-btn" id="home-mic" aria-label="' + OT.esc(t('search.voice', 'Speak your query')) + '" title="' + OT.esc(t('search.voice', 'Speak your query')) + '">' + OT.icon('mic', 22) + '</button>' +
      '<textarea id="ask-input" class="input ask-input" rows="2" placeholder="' + OT.esc(t('search.askPh', 'e.g. Hotel near Chandigarh station under ₹3,000')) + '">' + OT.esc(st) + '</textarea>' +
      '</div>' +
      '<div class="voice-status" id="voice-status" aria-live="polite"></div>' +
      '<div class="translit hidden" id="translit"></div>' +
      '<div class="parse-preview" id="parse-preview" aria-live="polite"></div>' +
      '<div class="samples"><span class="xs muted">' + OT.esc(t('search.samplesLabel', 'No mic? Try a sample voice query:')) + '</span>' +
      '<button type="button" class="chip sample-chip" data-sample="hi">' + OT.icon('play', 12) + ' हिन्दी · ' + OT.esc(t('search.sampleHi', 'Hindi')) + '</button>' +
      '<button type="button" class="chip sample-chip" data-sample="ta">' + OT.icon('play', 12) + ' தமிழ் · ' + OT.esc(t('search.sampleTa', 'Tamil')) + '</button>' +
      '<button type="button" class="chip sample-chip" data-sample="bn">' + OT.icon('play', 12) + ' বাংলা · ' + OT.esc(t('search.sampleBn', 'Bengali')) + '</button>' +
      '</div>' +
      '</div>' +
      '<div class="or-rule"><span>' + OT.esc(t('search.orForm', 'or fill in your trip')) + '</span></div>' +
      '<div class="form-grid">' +
      '<div class="field"><label for="f-from">' + OT.esc(t('search.from', 'From')) + '</label><select id="f-from" class="input">' + opt('from', sc.from, ['NDLS', 'MS', 'HWH']) + '</select></div>' +
      '<div class="field"><label for="f-to">' + OT.esc(t('search.to', 'To')) + '</label><select id="f-to" class="input">' + opt('to', to, ['CDG', 'MDU', 'PURI']) + '</select></div>' +
      '<div class="field"><label for="f-date">' + OT.esc(t('search.date', 'Travel date')) + '</label><input id="f-date" class="input" type="date" value="' + OT.esc(date) + '"></div>' +
      '<div class="field"><label for="f-pax">' + OT.esc(t('search.pax', 'Travellers')) + '</label><select id="f-pax" class="input">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<option' + (n === pax ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div>' +
      '<div class="field field-wide"><label for="f-budget">' + OT.esc(t('search.budget', 'Hotel budget per night')) + '</label><div class="rupee-input"><span>₹</span><input id="f-budget" class="input" type="number" min="500" max="20000" step="100" value="' + budget + '" inputmode="numeric"></div></div>' +
      '</div>' +
      '<div class="field"><span class="label">' + OT.esc(t('search.prefs', 'Preferences')) + '</span><div class="chips" id="f-prefs">' +
      PREFS.map(function (p) { return '<button type="button" class="chip" data-pref="' + p.k + '" aria-pressed="' + (prefs[p.k] ? 'true' : 'false') + '">' + OT.esc(t(p.key, p.en)) + '</button>'; }).join('') +
      '</div></div>' +
      '<div class="form-error hidden" id="form-error" role="alert"></div>' +
      '<button type="submit" class="btn btn-primary btn-lg btn-block" id="go-btn">' + OT.icon('search', 18) + OT.esc(t('search.go', 'Find verified options')) + '</button>' +
      '<div class="form-foot">' +
      '<button type="button" class="btn-link small" id="pnr-btn">' + OT.icon('train', 14) + ' ' + OT.esc(t('search.pnr', 'Import my train from PNR (simulated)')) + '</button>' +
      '<a class="small" href="https://www.irctc.co.in/" target="_blank" rel="noopener">' + OT.esc(t('home.irctc', 'Continue to IRCTC ticketing')) + ' ↗</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '<div class="track" aria-hidden="true"></div>' +
      '</section>' +

      '<section class="container how" aria-labelledby="how-h">' +
      '<h2 id="how-h">' + OT.esc(t('how.title', 'How OneTrip works')) + '</h2>' +
      '<ol class="how-steps">' +
      [['globe', 'how.1', 'Choose your language', 'how.1d', '11 Indian languages, typed or spoken.'],
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
        var s2 = D().scenarios[code], tr = D().trains[s2.trainNo], L = OT.i18n.lang();
        var nat = OT.lang.info(s2.lang).native;
        return '<button type="button" class="scen-card card-flat" data-scen="' + code + '">' +
          '<span class="scen-lang">' + OT.esc(nat) + '</span>' +
          '<strong>' + OT.esc(D().stationName(s2.from, L)) + ' → ' + OT.esc(D().stationName(code, L)) + '</strong>' +
          '<span class="small muted"><bdi class="keep">' + tr.no + '</bdi> ' + OT.esc(tr.name) + ' · <bdi class="keep">' + tr.dep + '</bdi>→<bdi class="keep">' + tr.arr + '</bdi></span>' +
          '<span class="small">' + OT.esc(t('scen.pax', '{n} travellers · budget {b}/night', { n: s2.passengers, b: OT.inr(s2.budget) })) + '</span>' +
          '</button>';
      }).join('') +
      '</div></section>';

    bind(el, q);
    cycleBoard(to);
    if (st) preview(st);
    if (q.voice === '1') setTimeout(function () { startVoice(); }, 150);
  }

  function setBoard(code) {
    var slot = root && root.querySelector('[data-board-slot]');
    if (!slot) return;
    slot.innerHTML = boardHTML(code);
    cycleBoard(code);
  }

  function status(html, kind) {
    var s = root && root.querySelector('#voice-status');
    if (!s) return;
    s.className = 'voice-status' + (kind ? ' vs-' + kind : '');
    s.innerHTML = html || '';
  }

  /** Live parse preview + form sync (shows what the agents understood). */
  function preview(text) {
    var box = root && root.querySelector('#parse-preview');
    if (!box) return;
    if (!String(text || '').trim()) { box.innerHTML = ''; return null; }
    var det = OT.lang.detect(text), it = OT.agents.parseQuery(text);
    var chips = ['<span class="pp-chip pp-lang">' + OT.icon('globe', 12) + ' ' + OT.esc(OT.lang.info(det.code).native) + ' · ' + Math.round(det.confidence * 100) + '%</span>'];
    if (it.to) chips.push('<span class="pp-chip">' + OT.icon('pin', 12) + ' ' + OT.esc(D().stationName(it.to, OT.i18n.lang())) + ' <bdi class="keep">' + it.to + '</bdi></span>');
    if (it.budget) chips.push('<span class="pp-chip">' + OT.icon('rupee', 12) + ' <bdi class="keep">' + OT.esc(OT.inr(it.budget)) + '</bdi></span>');
    it.types.forEach(function (ty) { chips.push('<span class="pp-chip">' + OT.icon(ty, 12) + ' ' + OT.esc(OT.t('tabs.' + ty, ty)) + '</span>'); });
    if (it.nearStation) chips.push('<span class="pp-chip">' + OT.icon('train', 12) + ' ' + OT.esc(OT.t('pref.near', 'Near station')) + '</span>');
    box.innerHTML = '<span class="xs muted">' + OT.esc(OT.t('search.understood', 'Understood:')) + '</span> ' + chips.join('');
    // sync the form so the traveller sees the effect
    var f = root.querySelector('#trip-form');
    if (it.to && f) { f.querySelector('#f-to').value = it.to; f.querySelector('#f-from').value = D().scenarios[it.to].from; setBoard(it.to); }
    if (it.budget && f) f.querySelector('#f-budget').value = it.budget;
    if (it.nearStation && f) { var b = f.querySelector('[data-pref="nearStation"]'); if (b) b.setAttribute('aria-pressed', 'true'); }
    if (it.prefs.veg && f) { var v = f.querySelector('[data-pref="veg"]'); if (v) v.setAttribute('aria-pressed', 'true'); }
    // transliteration suggestion for romanised input
    var tl = root.querySelector('#translit');
    if (tl) {
      var lang = OT.i18n.lang() === 'en' ? (det.romanised ? 'hi' : null) : OT.i18n.lang();
      var r = lang && /[A-Za-z]{3,}/.test(text) ? OT.lang.transliterate(text, lang) : null;
      if (r && r.changed && r.text !== text) {
        tl.classList.remove('hidden');
        tl.innerHTML = OT.icon('edit', 14) + ' <span class="xs muted">' + OT.esc(OT.t('search.translit', 'Transliteration:')) + '</span> <button type="button" class="btn-link" data-translit lang="' + lang + '">' + OT.esc(r.text) + '</button>';
        tl.querySelector('[data-translit]').addEventListener('click', function () {
          var ta = root.querySelector('#ask-input'); ta.value = r.text; OT.state.homeDraft = r.text; tl.classList.add('hidden'); preview(r.text);
        });
      } else { tl.classList.add('hidden'); tl.innerHTML = ''; }
    }
    return it;
  }

  function micBtn() { return root && root.querySelector('#home-mic'); }

  function startVoice() {
    if (!root) return;
    var ta = root.querySelector('#ask-input'), btn = micBtn();
    if (rec) { rec.stop(); rec = null; return; }
    var lang = OT.i18n.lang();
    status(OT.icon('mic', 14) + ' ' + OT.esc(OT.t('voice.listening', 'Listening… speak in {lang}', { lang: OT.lang.info(lang).native })), 'live');
    if (btn) btn.classList.add('listening');
    rec = OT.lang.listen({
      lang: lang,
      onInterim: function (txt) { ta.value = txt; },
      onResult: function (txt, conf) {
        ta.value = txt; OT.state.homeDraft = txt;
        status(OT.icon('checkCircle', 14) + ' ' + OT.esc(OT.t('voice.heard', 'Transcribed (ASR confidence {c}%)', { c: Math.round(conf * 100) })), 'ok');
        preview(txt);
      },
      onError: function (e) {
        status(OT.icon('info', 14) + ' ' + OT.esc(e.message) + ' <button type="button" class="btn-link" data-sample-inline="' + (OT.lang.samples[lang] ? lang : 'hi') + '">' + OT.esc(OT.t('voice.trySample', 'Try a sample voice query')) + '</button>', 'warn');
        var sb = root.querySelector('[data-sample-inline]');
        if (sb) sb.addEventListener('click', function () { sample(sb.getAttribute('data-sample-inline')); });
      },
      onEnd: function () { rec = null; if (btn) btn.classList.remove('listening'); }
    });
    if (!rec && btn) btn.classList.remove('listening');
  }

  /** Scripted sample voice query, typed out as if transcribed. */
  function sample(lang) {
    if (!root) return Promise.resolve();
    var ta = root.querySelector('#ask-input'), btn = micBtn();
    var text = OT.lang.samples[lang] || OT.lang.samples.hi;
    if (OT.i18n.lang() !== lang && lang !== 'en' && OT.i18n.lang() === 'en') { /* keep UI language; the agents detect the query language */ }
    if (btn) btn.classList.add('listening');
    status(OT.icon('mic', 14) + ' ' + OT.esc(OT.t('voice.simulating', 'Sample voice query (simulated ASR, {lang})…', { lang: OT.lang.info(lang).native })), 'live');
    ta.value = '';
    return OT.lang.simulateVoice(text, {
      wordMs: 120,
      onInterim: function (s) { ta.value = s; },
      onResult: function (s, c) {
        ta.value = s; OT.state.homeDraft = s;
        if (btn) btn.classList.remove('listening');
        status(OT.icon('checkCircle', 14) + ' ' + OT.esc(OT.t('voice.heardSim', 'Transcribed by simulated ASR (confidence {c}%)', { c: Math.round(c * 100) })), 'ok');
        preview(s);
      }
    });
  }

  function readForm() {
    var f = root.querySelector('#trip-form');
    var prefs = {};
    OT.$$('[data-pref]', f).forEach(function (b) { if (b.getAttribute('aria-pressed') === 'true') prefs[b.getAttribute('data-pref')] = true; });
    return {
      from: f.querySelector('#f-from').value, to: f.querySelector('#f-to').value, date: f.querySelector('#f-date').value,
      passengers: +f.querySelector('#f-pax').value, budget: +f.querySelector('#f-budget').value, prefs: prefs,
      q: f.querySelector('#ask-input').value.trim()
    };
  }

  function showError(msg) {
    var e = root.querySelector('#form-error');
    if (!e) return;
    if (!msg) { e.classList.add('hidden'); e.textContent = ''; return; }
    e.classList.remove('hidden'); e.textContent = msg;
  }

  function submit() {
    if (!root) return Promise.resolve(false);
    var v = readForm();
    if (v.q) { var it = OT.agents.parseQuery(v.q); if (it.to) { v.to = it.to; v.from = D().scenarios[it.to].from; } if (it.budget) v.budget = it.budget; }
    var sc = D().scenarios[v.to];
    if (!sc || sc.from !== v.from) {
      showError(OT.t('search.noTrain', 'No sample train for this pair. Try New Delhi → Chandigarh, Chennai → Madurai or Howrah → Puri.'));
      return Promise.resolve(false);
    }
    if (!v.date) { showError(OT.t('search.noDate', 'Please choose a travel date.')); return Promise.resolve(false); }
    if (!(v.budget >= 500)) { showError(OT.t('search.badBudget', 'Please enter a hotel budget of at least ₹500.')); return Promise.resolve(false); }
    showError('');
    var j = OT.store.get('journey');
    var same = j && j.scenario === v.to && j.train.date === v.date;
    var p = Promise.resolve(true);
    if (j && !same && (j.items || []).some(function (i) { return i.status !== 'cancelled'; })) {
      p = OT.confirmAction({
        title: OT.t('search.replaceTitle', 'Start a new trip?'),
        lines: [OT.esc(OT.t('search.replaceLine', 'Your current trip to {city} has {n} item(s). Starting a new trip keeps your bookings but replaces the plan.', {
          city: D().stationName(j.train.to, OT.i18n.lang()), n: j.items.filter(function (i) { return i.status !== 'cancelled'; }).length }))],
        confirmLabel: OT.t('search.replaceOk', 'Start new trip')
      });
    }
    return p.then(function (ok) {
      if (!ok) return false;
      if (same) {
        OT.store.update('journey', function (cur) { cur.budget = v.budget; cur.prefs = v.prefs; cur.passengers = v.passengers; return cur; });
      } else {
        OT.store.set('journey', D().makeJourney(v.to, { date: v.date, passengers: v.passengers, budget: v.budget, prefs: v.prefs }));
      }
      OT.state.homeDraft = v.q;
      var qs = 'results?to=' + encodeURIComponent(v.to) + (v.q ? '&q=' + encodeURIComponent(v.q) : '');
      OT.go(qs);
      return true;
    });
  }

  function pnrModal() {
    var t = OT.t;
    OT.modal({
      title: t('pnr.title', 'Import train from PNR (simulated)'),
      body: '<p class="small muted">' + OT.esc(t('pnr.note', 'No live PNR lookup. Only these sample PNRs exist in the demo data:')) + '</p>' +
        '<ul class="pnr-samples">' + ['CDG', 'MDU', 'PURI'].map(function (c) { var s = D().scenarios[c]; return '<li><button type="button" class="btn-link" data-pnr="' + s.pnr + '"><bdi class="keep">' + s.pnr + '</bdi></button> · ' + OT.esc(D().stationName(s.from, OT.i18n.lang())) + ' → ' + OT.esc(D().stationName(c, OT.i18n.lang())) + '</li>'; }).join('') + '</ul>' +
        '<div class="field"><label for="pnr-in">' + OT.esc(t('pnr.label', '10-digit PNR')) + '</label><input id="pnr-in" class="input mono-num" inputmode="numeric" maxlength="10" value="4521837690"></div>' +
        '<p class="small" id="pnr-msg" aria-live="polite"></p>',
      onOpen: function (body) {
        OT.$$('[data-pnr]', body).forEach(function (b) { b.addEventListener('click', function () { body.querySelector('#pnr-in').value = b.getAttribute('data-pnr'); }); });
      },
      actions: [
        { label: t('common.cancel', 'Cancel'), kind: 'ghost' },
        { label: t('pnr.fetch', 'Fetch (simulated)'), kind: 'primary', onClick: function (close) {
          var inp = document.getElementById('pnr-in'), msg = document.getElementById('pnr-msg');
          var sc = D().findPnr(inp.value);
          if (!/^\d{10}$/.test(inp.value.trim())) { msg.textContent = t('pnr.bad', 'Enter a 10-digit PNR.'); msg.className = 'small text-bad'; return; }
          if (!sc) { msg.textContent = t('pnr.notFound', 'PNR not found in the sample data. Try 4521837690.'); msg.className = 'small text-bad'; return; }
          msg.textContent = t('pnr.loading', 'Reading sample PNR…'); msg.className = 'small muted';
          OT.sleep(600).then(function () {
            var j = D().makeJourney(sc.key, {});
            OT.store.set('journey', j);
            close();
            OT.toast(t('pnr.ok', 'Train {no} imported: {from} → {to} (sample)', { no: j.train.no, from: j.train.from, to: j.train.to }), 'success');
            if (root && document.body.contains(root)) OT.router.render();
          });
        } }
      ]
    });
  }

  function bind(el, q) {
    var f = el.querySelector('#trip-form');
    var ta = el.querySelector('#ask-input');
    f.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    ta.addEventListener('input', OT.debounce(function () { OT.state.homeDraft = ta.value; preview(ta.value); }, 250));
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
    el.querySelector('#home-mic').addEventListener('click', startVoice);
    OT.$$('[data-sample]', el).forEach(function (b) { b.addEventListener('click', function () { sample(b.getAttribute('data-sample')); }); });
    OT.$$('[data-pref]', el).forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); }); });
    f.querySelector('#f-to').addEventListener('change', function (e) {
      var sc = D().scenarios[e.target.value];
      f.querySelector('#f-from').value = sc.from;
      f.querySelector('#f-budget').value = sc.budget;
      setBoard(e.target.value); showError('');
    });
    f.querySelector('#f-from').addEventListener('change', function () { showError(''); });
    el.querySelector('#pnr-btn').addEventListener('click', pnrModal);
    OT.$$('[data-scen]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-scen'), sc = D().scenarios[code];
        f.querySelector('#f-to').value = code; f.querySelector('#f-from').value = sc.from; f.querySelector('#f-budget').value = sc.budget;
        f.querySelector('#f-pax').value = sc.passengers;
        OT.$$('[data-pref]', f).forEach(function (p) { p.setAttribute('aria-pressed', sc.prefs[p.getAttribute('data-pref')] ? 'true' : 'false'); });
        ta.value = ''; OT.state.homeDraft = ''; preview('');
        setBoard(code); showError('');
        f.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  OT.registerView('home', {
    title: function () { return OT.t('nav.plan', 'Plan trip'); },
    section: 'home',
    render: render,
    onLeave: function () { clearInterval(timer); if (rec) { rec.stop(); rec = null; } OT.lang && OT.lang.stopListening(); root = null; },
    startVoice: startVoice,
    sample: sample,
    submit: submit
  });
})();
