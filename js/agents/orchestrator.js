/* IRCTC OneTrip — Orchestrator Agent (SIMULATED agentic workflow).
 *
 * OT.agents.run(query, {onStep, lang, intent, fast}) -> Promise<run>
 * Pattern: orchestrator–worker with task decomposition (plan), tool calls, a reflection step
 * ("plan updated" after verification flags), and human-in-the-loop (agents propose, the traveller
 * confirms every booking/payment/cancellation). Steps stream to the visible Agent Trace:
 *   {id, agent, status:'running'|'done'|'warn', title, detail, ms, lines[], tool?}
 */
(function () {
  'use strict';
  var OT = window.OT;
  function T(k, fb, v) { return OT.t ? OT.t(k, fb, v) : fb; }
  OT.state = OT.state || {};

  function cityName(code, lang) { return OT.data.travel.stationName(code, lang); }

  /** Localised one-paragraph summary used on screen and for text-to-speech. */
  OT.agents.summarize = function (run, lang) {
    lang = lang || (OT.i18n ? OT.i18n.lang() : 'en');
    var hotels = run.rec.byType.hotel, top = hotels[0];
    var verified = hotels.filter(function (v) { return v.verdict === 'verified'; }).length;
    var conf = hotels.filter(function (v) { return v.verdict === 'confirm'; }).length;
    var vars = { n: verified, c: conf, h: run.rec.hidden.length, city: cityName(run.intent.to, lang), budget: run.intent.budget ? OT.inr(run.intent.budget) : '—' };
    var s;
    if (!top) s = T('res.summaryNone', 'No hotel near {city} matched your budget of {budget}. Try a higher budget.', vars);
    else {
      vars.name = top.item.name; vars.price = OT.inr(top.livePrice); vars.dist = top.item.distanceKm;
      s = T('res.summary', 'I found {n} verified hotels near {city} station within {budget}. Top pick: {name}, {price} per night, {dist} km from the station.', vars);
      if (conf || vars.h) s += ' ' + T('res.summaryFlags', '{c} need confirmation and {h} were hidden by the Verification Agent.', vars);
    }
    return s;
  };

  OT.agents.run = function (query, opts) {
    opts = opts || {};
    var onStep = opts.onStep || function () {};
    var lang = opts.lang || (OT.i18n ? OT.i18n.lang() : 'en');
    var fast = !!opts.fast;
    var t0 = performance.now();
    var steps = [];
    function wait(ms) { return OT.sleep(fast ? Math.min(ms, 40) : ms); }
    function begin(agent, title) {
      var s = { id: 's' + steps.length, agent: agent, status: 'running', title: title, lines: [], startedAt: performance.now() };
      steps.push(s); onStep(s, steps); return s;
    }
    function end(s, status, detail, extra) {
      s.status = status || 'done'; s.detail = detail || ''; s.ms = Math.round(performance.now() - s.startedAt);
      if (extra) Object.keys(extra).forEach(function (k) { s[k] = extra[k]; });
      onStep(s, steps); return s;
    }
    function L(key, en, vars) { return { key: key, en: en, vars: vars || {} }; }

    var run = { query: query, lang: lang, steps: steps, startedAt: new Date().toISOString() };
    var D = OT.data.travel;

    return Promise.resolve().then(function () {
      /* 1. Orchestrator: plan (task decomposition) */
      var s = begin('orchestrator', L('tr.plan', 'Plan the task'));
      return wait(380).then(function () {
        end(s, 'done', '', { lines: [
          L('tr.plan1', '1) Understand the query (Multilingual)'),
          L('tr.plan2', '2) Research hotels, cabs, food, sightseeing (Research)'),
          L('tr.plan3', '3) Independently re-check every record (Verification)'),
          L('tr.plan4', '4) Rank by budget, preferences, distance (Recommendation)'),
          L('tr.plan5', '5) Draft the timeline and flag conflicts (Itinerary)'),
          L('tr.plan6', '6) Reply in the traveller\'s language (Multilingual)'),
          L('tr.autonomy', 'Degree of autonomy: agents research and propose; the traveller confirms every booking (human-in-the-loop)')
        ] });
      });
    }).then(function () {
      /* 2. Multilingual: detect + NMT to English with protected tokens */
      var s = begin('multilingual', L('tr.ml1', 'Detect language and translate query'));
      var det = OT.lang ? OT.lang.detect(query) : { code: lang, confidence: 1 };
      run.detected = det;
      var prot = OT.lang ? OT.lang.protectTokens(OT.lang.normDigits(query)) : { tokens: [] };
      run.intent = OT.agents.parseQuery(query);
      // merge form fields (search form always wins for explicit values)
      var fi = opts.intent || {};
      ['to', 'budget', 'date', 'passengers'].forEach(function (k) { if (fi[k] && !run.intent[k]) run.intent[k] = fi[k]; });
      if (fi.to) run.intent.to = run.intent.to || fi.to;
      run.intent.prefs = Object.assign({}, fi.prefs || {}, run.intent.prefs.veg ? { veg: true } : {}, run.intent.prefs.family ? { family: true } : {});
      if (fi.nearStation) run.intent.nearStation = true;
      return (OT.lang ? OT.lang.translate(query, det.code, 'en', { intent: run.intent }) : Promise.resolve({ text: query, confidence: 1, engine: 'none' }))
        .then(function (tr) {
          run.translation = tr;
          return wait(420).then(function () {
            var name = OT.lang ? OT.lang.info(det.code).name : det.code;
            end(s, 'done', '', { lines: [
              L('tr.detected', 'Language detected: {lang} (confidence {c}%)', { lang: name, c: Math.round(det.confidence * 100) }),
              L('tr.nmt', 'NMT {from}→en via {engine} (confidence {c}%): "{text}"', { from: det.code, engine: tr.engine, c: Math.round(tr.confidence * 100), text: tr.text }),
              L('tr.tokens', 'Protected tokens (never translated): {tokens}', { tokens: prot.tokens.length ? prot.tokens.join(', ') : (run.intent.to || '—') })
            ], tokens: prot.tokens });
          });
        });
    }).then(function () {
      /* 3. Orchestrator: intent extraction (model routing: Gemini if configured, else rules) */
      var s = begin('orchestrator', L('tr.intent', 'Extract intent → tool parameters'));
      var useLLM = OT.gemini && OT.gemini.available();
      var p = useLLM ? OT.gemini.generate(
        'Extract travel intent from this traveller query. Return JSON {"to": one of ["CDG","MDU","PURI"] or null, "budget": number or null, "types": array of "hotel","cab","food","sight", "nearStation": boolean, "veg": boolean}.\nQuery: ' + query,
        { json: true, timeoutMs: 9000, temperature: 0 }
      ).then(function (j) {
        var ok = j && typeof j === 'object';
        if (ok && ['CDG', 'MDU', 'PURI'].indexOf(j.to) >= 0 && !run.intent.to) run.intent.to = j.to;
        if (ok && typeof j.budget === 'number' && j.budget >= 300 && j.budget <= 50000 && !run.intent.budget) run.intent.budget = j.budget;
        if (ok && Array.isArray(j.types) && !run.intent.types.length) run.intent.types = j.types.filter(function (x) { return ['hotel', 'cab', 'food', 'sight'].indexOf(x) >= 0; });
        if (ok && j.nearStation) run.intent.nearStation = true;
        run.intent.engine = 'gemini+rules';
        return 'gemini';
      }).catch(function () { return 'fallback'; }) : Promise.resolve('rules');
      return p.then(function (engine) {
        if (!run.intent.to) run.intent.to = (opts.intent && opts.intent.to) || 'CDG';
        if (!run.intent.budget) run.intent.budget = D.scenarios[run.intent.to] ? D.scenarios[run.intent.to].budget : 3000;
        if (!run.intent.types.length) run.intent.types = ['hotel'];
        run.intent.nearStation = run.intent.nearStation || !!(run.intent.prefs && run.intent.prefs.nearStation);
        var call = { tool: 'plan_trip', to: run.intent.to, max_price: run.intent.budget, focus: run.intent.types, near_station: run.intent.nearStation, veg: !!run.intent.prefs.veg };
        return wait(300).then(function () {
          var route = engine === 'gemini' ? L('tr.routeLLM', 'Model routing: intent → Gemini ({model}), validated by rules', { model: OT.gemini.model() })
            : engine === 'fallback' ? L('tr.routeFail', 'Gemini call failed → fell back to rule-based parser (no data invented)')
              : L('tr.routeRules', 'Model routing: rule-based parser (simulated mode, 11-language keyword maps)');
          end(s, 'done', '', { lines: [route], tool: call });
        });
      });
    }).then(function () {
      /* 4. Research */
      var s = begin('research', L('tr.research', 'Query provider sources'));
      run.research = OT.agents.research(run.intent);
      return wait(650).then(function () {
        var byT = { hotel: 0, cab: 0, food: 0, sight: 0 };
        run.research.records.forEach(function (r) { byT[r.item.type]++; });
        var lines = run.research.toolCalls.map(function (tc) { return L('tr.tool', '{tool}({args}) → {n} records', { tool: tc.call.tool, args: 'city:"' + tc.call.city + '"' + (tc.call.max_price ? ', max_price:' + tc.call.max_price : ''), n: tc.returned }); });
        lines.push(L('tr.sources', 'Sources checked: {list}', { list: Object.keys(run.research.sources).join(' · ') }));
        lines.push(L('tr.recorded', 'Recorded source + checkedAt for every price, rating, availability and policy'));
        end(s, 'done', '', { lines: lines, counts: byT });
      });
    }).then(function () {
      /* 5. Verification */
      var s = begin('verification', L('tr.verify', 'Independent re-check against provider source'));
      run.verified = OT.agents.verify(run.research.records);
      return wait(800).then(function () {
        var flags = [];
        run.verified.forEach(function (v) { v.flags.forEach(function (f) { flags.push({ key: f.key, en: f.en, vars: f.vars, kind: f.kind, verdict: v.verdict }); }); });
        var ok = run.verified.filter(function (v) { return v.verdict === 'verified'; }).length;
        var lines = [L('tr.verOk', '{ok} of {n} records verified in 2 sources', { ok: ok, n: run.verified.length })].concat(flags);
        end(s, flags.length ? 'warn' : 'done', '', { lines: lines });
      });
    }).then(function () {
      /* 6. Orchestrator reflection: plan updated */
      var stale = run.verified.filter(function (v) { return v.flags.some(function (f) { return f.kind === 'stale'; }); });
      var sold = run.verified.filter(function (v) { return v.verdict === 'unavailable'; });
      if (!stale.length && !sold.length) return null;
      var s = begin('orchestrator', L('tr.reflect', 'Reflection: plan updated'));
      return wait(320).then(function () {
        var lines = [];
        if (sold.length) lines.push(L('tr.reflSold', 'Removed {n} sold-out record(s) before ranking', { n: sold.length }));
        if (stale.length) lines.push(L('tr.reflStale', 'Queued re-check for {n} stale record(s); shown as Needs confirmation until refreshed', { n: stale.length }));
        lines.push(L('tr.reflPrice', 'Contradictory prices: show the provider\'s value and ask the traveller to accept it'));
        end(s, 'warn', '', { lines: lines });
      });
    }).then(function () {
      /* 7. Recommendation */
      var s = begin('recommendation', L('tr.rank', 'Rank by budget, preferences and distance'));
      run.rec = OT.agents.recommend(run.verified, run.intent);
      return wait(450).then(function () {
        var h = run.rec.byType.hotel;
        var total = run.research.records.filter(function (r) { return r.item.type === 'hotel'; }).length;
        var fb = run.rec.filtered.filter(function (f) { return f.v.item.type === 'hotel' && f.reason === 'budget'; }).length;
        var hs = run.rec.hidden.filter(function (f) { return f.v.item.type === 'hotel'; }).length;
        var cf = h.filter(function (v) { return v.verdict === 'confirm'; }).length;
        var lines = [L('tr.funnel', 'Hotels: {t} found → {b} over budget → {s} sold out → {n} shown ({c} need confirmation)', { t: total, b: fb, s: hs, n: h.length, c: cf })];
        if (h[0]) lines.push(L('tr.top', 'Top pick: {name} ({price}/night, {d} km, rated {r})', { name: h[0].item.name, price: OT.inr(h[0].livePrice), d: h[0].item.distanceKm, r: h[0].item.rating }));
        lines.push(L('tr.sponsor', 'Guardrail: sponsored listings are labelled and can rise at most one slot'));
        end(s, 'done', '', { lines: lines });
      });
    }).then(function () {
      /* 8. Itinerary draft */
      var s = begin('itinerary', L('tr.itin', 'Draft the chronological plan'));
      var tr = D.trains[(D.scenarios[run.intent.to] || D.scenarios.CDG).trainNo];
      var top = run.rec.byType.hotel[0];
      return wait(450).then(function () {
        var lines = [L('tr.itinTrain', 'Train {no} arrives {to} at {arr} (sample timing)', { no: tr.no, to: tr.to, arr: tr.arr })];
        var status = 'done';
        if (top) {
          var gap = OT.agents.time.toMin(top.item.checkIn) - OT.agents.time.toMin(tr.arr);
          if (gap > 30) {
            status = 'warn';
            lines.push(L('tr.conflict', 'Conflict: arrival {arr} vs check-in {ci} → {gap} wait', { arr: tr.arr, ci: top.item.checkIn, gap: OT.agents.time.fmtGap(gap) }));
            lines.push(L('tr.fixes', 'Suggested fixes: request early check-in · station cloakroom · visit a nearby sight in the gap'));
          } else lines.push(L('tr.noConflict', 'Check-in {ci} fits the arrival time', { ci: top.item.checkIn }));
        }
        run.trainPreview = tr;
        end(s, status, '', { lines: lines });
      });
    }).then(function () {
      /* 9. Multilingual: respond in the user's language */
      var s = begin('multilingual', L('tr.ml2', 'Compose reply in {lang}', { lang: OT.lang ? OT.lang.info(lang).name : lang }));
      run.summary = OT.agents.summarize(run, lang);
      run.summaryEn = OT.agents.summarize(run, 'en');
      var covered = lang === 'en' || (OT.i18n && OT.i18n.has('res.summary', lang));
      return wait(380).then(function () {
        var lines = [covered ? L('tr.ml2ok', 'Reply rendered with reviewed {lang} templates; protected tokens unchanged', { lang: OT.lang ? OT.lang.info(lang).name : lang })
          : L('tr.ml2miss', '{lang} template not available, showing English (would use live NMT)', { lang: OT.lang ? OT.lang.info(lang).name : lang })];
        lines.push(L('tr.tts', 'TTS ready: speaker button reads the summary aloud'));
        end(s, covered ? 'done' : 'warn', '', { lines: lines });
      });
    }).then(function () {
      run.ms = Math.round(performance.now() - t0);
      run.done = true;
      OT.state.lastRun = run;
      OT.emit('agents:run', run);
      return run;
    });
  };
})();
