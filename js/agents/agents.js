/* IRCTC OneTrip — specialist agents (SIMULATED, deterministic rules over the sample catalogue).
 *
 * Agents never invent prices, availability, ratings or timings: every value comes from
 * OT.data.travel and carries its source + checkedAt. Gemini (optional) is used only for
 * language understanding / phrasing, and its output is validated against the catalogue.
 *
 *   OT.agents.defs                     agent registry (name, icon, role) for the Agent Trace
 *   OT.agents.parseQuery(text)         -> intent {to, budget, types[], nearStation, prefs, confidence}
 *   OT.agents.research(intent)         Research Agent      -> {records, sources, toolCalls}
 *   OT.agents.verify(records)          Verification Agent  -> [{item, verdict, flags, checks, livePrice}]
 *   OT.agents.recommend(verified, i)   Recommendation Agent-> {byType, hidden, filtered}
 *   OT.agents.slotFor(item, journey)   Itinerary helper    -> {when, endWhen}
 *   OT.agents.itinerary(journey)       Itinerary Agent     -> {events, conflicts}
 *   OT.agents.readiness(journey)       Trip Readiness      -> {score, parts}
 *   OT.agents.support(text, {lang})    Customer Support    -> Promise<{text, actions, escalated, ticket, citations, confidence, engine}>
 *   OT.agents.partnerDraftReply(enq)   Partner Agent       -> {text, textEn, lang, confidence, note}
 *   OT.agents.refundFor(booking)       policy-based refund calculation
 */
(function () {
  'use strict';
  var OT = window.OT;
  OT.agents = OT.agents || {};
  function T(k, fb, v) { return OT.t ? OT.t(k, fb, v) : fb; }
  function D() { return OT.data.travel; }

  OT.agents.defs = {
    orchestrator: { icon: 'layers', name: 'Orchestrator', role: 'Plans, assigns tasks, merges results' },
    multilingual: { icon: 'globe', name: 'Multilingual', role: 'ASR · NMT · TTS · token protection (BHASHINI-ready, simulated)' },
    research: { icon: 'search', name: 'Research', role: 'Queries provider sources, records source + time' },
    verification: { icon: 'shield', name: 'Verification', role: 'Independent re-check against provider source' },
    recommendation: { icon: 'target', name: 'Recommendation', role: 'Ranks by budget, preferences, distance' },
    itinerary: { icon: 'route', name: 'Itinerary', role: 'Builds the chronological plan, flags conflicts' },
    support: { icon: 'headset', name: 'Customer Support', role: 'Booking, cancellation, refund, PNR; escalates' },
    partner: { icon: 'store', name: 'Partner', role: 'Helps partners with listings and enquiries' }
  };
  OT.agents.name = function (id) { return T('agent.' + id, (OT.agents.defs[id] || {}).name || id); };

  /* ---------------- time helpers ---------------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function toMin(hhmm) { var p = String(hhmm || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fromMin(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function fmtDate(ymd) { if (!ymd) return ''; var p = String(ymd).slice(0, 10).split('-'); return (+p[2]) + ' ' + MON[(+p[1]) - 1] + ' ' + p[0]; }
  function fmtGap(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h ? h + ' ' + T('time.h', 'h') + (m ? ' ' : '') : '') + (m ? m + ' ' + T('time.min', 'min') : '');
  }
  function stamp(ts) { var d = new Date(ts); return OT.stamp ? OT.stamp(d) : d.toISOString(); }
  function agoLabel(iso) {
    var mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return T('time.minsAgo', '{n} min ago', { n: mins });
    return T('time.hoursAgo', '{n} h ago', { n: Math.round(mins / 6) / 10 });
  }
  function dt(dateStr, hhmm) { return dateStr + 'T' + hhmm; }
  function addMinIso(iso, mins) {
    var d = new Date(iso.length === 16 ? iso + ':00' : iso); d.setMinutes(d.getMinutes() + mins);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function isoMs(iso) { return new Date(String(iso).length === 16 ? iso + ':00' : iso).getTime(); }
  OT.agents.time = { toMin: toMin, fromMin: fromMin, fmtDate: fmtDate, fmtGap: fmtGap, agoLabel: agoLabel, addMinIso: addMinIso, isoMs: isoMs, stamp: stamp };
  OT.fmtDate = fmtDate;

  /* ---------------- Query understanding (11 languages, rule-based) ---------------- */
  var KW = {
    hotel: ['hotel', 'stay', 'room', 'lodge', 'होटल', 'कमरा', 'ठहर', 'रुकने', 'धर्मशाला', 'हॉटेल', 'राहण्', 'হোটেল', 'থাকার', 'ধর্মশালা', 'ஹோட்டல்', 'தங்கும்', 'விடுதி', 'அறை', 'లాడ్జ్', 'హోటల్', 'గది', 'ಹೋಟೆಲ್', 'ಕೊಠಡಿ', 'ഹോട്ടൽ', 'മുറി', 'હોટલ', 'હોટેલ', 'રૂમ', 'ਹੋਟਲ', 'ਕਮਰਾ', 'ହୋଟେଲ', 'ରହିବା'],
    cab: ['cab', 'taxi', 'auto', 'transfer', 'pickup', 'ride', 'टैक्सी', 'कैब', 'ऑटो', 'गाड़ी', 'गाडी', 'ট্যাক্সি', 'ক্যাব', 'গাড়ি', 'டாக்ஸி', 'கார்', 'ஆட்டோ', 'ట్యాక్సీ', 'క్యాబ్', 'ಟ್ಯಾಕ್ಸಿ', 'ಕ್ಯಾಬ್', 'ടാക്സി', 'ക്യാബ്', 'ટેક્સી', 'કેબ', 'ਟੈਕਸੀ', 'ਕੈਬ', 'ଟ୍ୟାକ୍ସି', 'ଗାଡ଼ି'],
    food: ['food', 'meal', 'thali', 'lunch', 'dinner', 'breakfast', 'catering', 'खाना', 'भोजन', 'थाली', 'नाश्ता', 'जेवण', 'খাবার', 'খাওয়া', 'சாப்பாடு', 'உணவு', 'భోజనం', 'ఆహారం', 'ಊಟ', 'ಆಹಾರ', 'ഭക്ഷണം', 'ભોજન', 'જમવા', 'ਖਾਣਾ', 'ਭੋਜਨ', 'ଖାଦ୍ୟ', 'ଖାଇବା'],
    sight: ['sight', 'visit', 'tour', 'temple', 'see', 'घूम', 'मंदिर', 'दर्शन', 'पर्यटन', 'फिर', 'ঘুর', 'মন্দির', 'দর্শন', 'சுற்றுலா', 'கோயில்', 'கோவில்', 'தரிசனம்', 'పర్యటన', 'ఆలయం', 'ಪ್ರವಾಸ', 'ದೇವಾಲಯ', 'ക്ഷേത്രം', 'സന്ദർശ', 'ફરવા', 'મંદિર', 'ਘੁੰਮ', 'ਮੰਦਰ', 'ବୁଲିବା', 'ମନ୍ଦିର']
  };
  var NEAR = ['station', 'railway', 'स्टेशन', 'रेलवे', 'স্টেশন', 'রেল', 'நிலைய', 'ஸ்டேஷன்', 'ரயில்', 'స్టేషన్', 'రైల్వే', 'ನಿಲ್ದಾಣ', 'ಸ್ಟೇಷನ್', 'സ്റ്റേഷൻ', 'റെയിൽവേ', 'સ્ટેશન', 'ਸਟੇਸ਼ਨ', 'ଷ୍ଟେସନ', 'near', 'पास', 'নজদীক', 'কাছে', 'அருகே', 'அருகில்', 'దగ్గర', 'ಹತ್ತಿರ', 'അടുത്ത്', 'નજીક', 'ਨੇੜੇ', 'ପାଖରେ', 'जवळ'];
  var VEG = ['veg', 'vegetarian', 'शाकाहारी', 'शुद्ध', 'নিরামিষ', 'சைவ', 'శాకాహార', 'ಸಸ್ಯಾಹಾರ', 'സസ്യാഹാര', 'શાકાહારી', 'ਸ਼ਾਕਾਹਾਰੀ', 'ନିରାମିଷ', 'शाकाहार'];
  var FAMILY = ['family', 'parents', 'kids', 'परिवार', 'बच्चे', 'পরিবার', 'குடும்ப', 'కుటుంబ', 'ಕುಟುಂಬ', 'കുടുംബ', 'પરિવાર', 'ਪਰਿਵਾਰ', 'ପରିବାର', 'कुटुंब'];
  var THOUSAND = ['thousand', 'hazaar', 'hazar', 'hajar', 'हज़ार', 'हजार', 'হাজার', 'ஆயிர', 'వేల', 'వెయ్యి', 'ಸಾವಿರ', 'ആയിര', 'હજાર', 'ਹਜ਼ਾਰ', 'ਹਜਾਰ', 'ହଜାର'];
  var UNITS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, ek: 1, do: 2, teen: 3, char: 4, paanch: 5, dhai: 2.5, dedh: 1.5,
    'एक': 1, 'दो': 2, 'दोन': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'पाच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'ढाई': 2.5, 'डेढ़': 1.5, 'डेढ': 1.5, 'अडीच': 2.5, 'दीड': 1.5,
    'এক': 1, 'দুই': 2, 'দু': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5, 'আড়াই': 2.5, 'দেড়': 1.5,
    'ஒரு': 1, 'இரண்டு': 2, 'ரெண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5,
    'ఒక': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
    'ಒಂದು': 1, 'ಎರಡು': 2, 'ಮೂರು': 3, 'ನಾಲ್ಕು': 4, 'ಐದು': 5,
    'ഒരു': 1, 'രണ്ട്': 2, 'മൂന്ന്': 3, 'നാല്': 4, 'അഞ്ച്': 5,
    'એક': 1, 'બે': 2, 'ત્રણ': 3, 'ચાર': 4, 'પાંચ': 5, 'અઢી': 2.5, 'દોઢ': 1.5,
    'ਇੱਕ': 1, 'ਦੋ': 2, 'ਤਿੰਨ': 3, 'ਚਾਰ': 4, 'ਪੰਜ': 5, 'ਢਾਈ': 2.5, 'ਡੇਢ': 1.5,
    'ଏକ': 1, 'ଦୁଇ': 2, 'ତିନି': 3, 'ଚାରି': 4, 'ପାଞ୍ଚ': 5, 'ଅଢ଼େଇ': 2.5, 'ଦେଢ଼': 1.5
  };
  var COMPOUND = { 'இரண்டாயிர': 2000, 'ரெண்டாயிர': 2000, 'மூவாயிர': 3000, 'மூன்றாயிர': 3000, 'நாலாயிர': 4000, 'நான்காயிர': 4000, 'ஐயாயிர': 5000, 'ஆயிர': 1000,
    'രണ്ടായിര': 2000, 'മൂവായിര': 3000, 'നാലായിര': 4000, 'ആയിര': 1000, 'వెయ్యి': 1000 };
  var CURRENCY = /(rupees?|rs\.?|inr|रुपये|रुपए|रुपया|रूपये|টাকা|ரூபாய்|రూపాయ|ರೂಪಾಯಿ|രൂപ|રૂપિયા|ਰੁਪਏ|ଟଙ୍କା)/;

  function has(t, list) { for (var i = 0; i < list.length; i++) if (t.indexOf(list[i].toLowerCase()) >= 0) return list[i]; return null; }
  function parseBudget(t) {
    var m = t.match(/(?:₹|rs\.?\s?|inr\s?)\s*(\d[\d,]*)/);
    if (m) return +m[1].replace(/,/g, '');
    m = t.match(/(\d[\d,]*)\s*(k\b|हज़ार|हजार|thousand|হাজার)/);
    if (m) return +m[1].replace(/,/g, '') * 1000;
    m = t.match(new RegExp('(\\d[\\d,]*)\\s*' + CURRENCY.source));
    if (m) return +m[1].replace(/,/g, '');
    var words = t.split(/[\s,।.?!]+/);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      for (var c in COMPOUND) {
        if (w.indexOf(c) === 0) {
          // "ஆயிரம்" alone may be preceded by a unit word
          if ((c === 'ஆயிர' || c === 'ആയിര') && i > 0 && UNITS[words[i - 1]]) return UNITS[words[i - 1]] * 1000;
          return COMPOUND[c];
        }
      }
      if (has(w, THOUSAND)) {
        var prev = words[i - 1] || '';
        var u = UNITS[prev] || (/^\d+(\.\d+)?$/.test(prev) ? +prev : 1);
        return Math.round(u * 1000);
      }
    }
    m = t.match(/\b(\d{3,4})\b/);
    if (m && +m[1] >= 300 && +m[1] <= 9999) return +m[1];
    return null;
  }
  function findCity(t) {
    var st = D().stations, dests = ['CDG', 'MDU', 'PURI'];
    for (var i = 0; i < dests.length; i++) {
      var s = st[dests[i]];
      var names = Object.keys(s.names).map(function (k) { return s.names[k]; }).concat(s.alias);
      if (has(t, names) || new RegExp('\\b' + s.code + '\\b', 'i').test(t)) return s.code;
    }
    return null;
  }
  OT.agents.parseQuery = function (text) {
    var raw = String(text || '');
    var t = (OT.lang ? OT.lang.normDigits(raw) : raw).toLowerCase();
    var types = [];
    Object.keys(KW).forEach(function (k) { if (has(t, KW[k])) types.push(k); });
    var intent = {
      raw: raw, to: findCity(t), budget: parseBudget(t), types: types,
      nearStation: !!has(t, NEAR), prefs: { veg: !!has(t, VEG), family: !!has(t, FAMILY) }, engine: 'rules'
    };
    var found = (intent.to ? 1 : 0) + (intent.budget ? 1 : 0) + (types.length ? 1 : 0) + (intent.nearStation ? 1 : 0);
    intent.confidence = Math.round((0.4 + found * 0.14) * 100) / 100;
    return intent;
  };
  OT.agents.intentToEnglish = function (i) {
    var typeEn = { hotel: 'a hotel', cab: 'a cab', food: 'food', sight: 'sightseeing' };
    var what = (i.types && i.types.length ? i.types : ['hotel']).map(function (x) { return typeEn[x]; }).join(' and ');
    var city = i.to ? D().stations[i.to].names.en + ' (' + i.to + ')' : 'the destination';
    return 'Looking for ' + what + (i.nearStation ? ' near ' + city + ' railway station' : ' in ' + city) + (i.budget ? ' up to ' + OT.inr(i.budget) : '') + '.';
  };

  /* ---------------- Research Agent ---------------- */
  OT.agents.research = function (intent) {
    var city = intent.to || 'CDG';
    var types = ['hotel', 'cab', 'food', 'sight'];
    var toolCalls = [], sources = {}, records = [];
    types.forEach(function (ty) {
      var tool = { hotel: 'hotel_search', cab: 'cab_search', food: 'food_search', sight: 'sight_search' }[ty];
      var args = { tool: tool, city: city, near: intent.nearStation ? city : undefined, date: intent.date };
      if (ty === 'hotel' && intent.budget) args.max_price = intent.budget;
      var found = D().byCity(city, ty);
      found.forEach(function (x) {
        sources[x.source.name] = (sources[x.source.name] || 0) + 1;
        records.push({ item: x, checkedAt: x.source.checkedAt, source: x.source });
      });
      toolCalls.push({ call: JSON.parse(JSON.stringify(args)), returned: found.length });
    });
    return { city: city, records: records, sources: sources, toolCalls: toolCalls, at: new Date().toISOString() };
  };

  /* ---------------- Verification Agent ---------------- */
  var rechecked = {};      // id -> ms timestamp of a manual re-check this session
  OT.agents.recheck = function (id) { rechecked[id] = Date.now(); return OT.agents.verifyOne(D().get(id)); };
  OT.agents.verifyOne = function (x) {
    if (!x) return null;
    var ps = x.providerSource, flags = [], checks = [];
    var staleMs = D().staleHours * 3600000;
    var srcAt = rechecked[x.id] ? new Date(rechecked[x.id]).toISOString() : ps.checkedAt;
    var age = Date.now() - new Date(srcAt).getTime();
    var verdict = 'verified', livePrice = ps.price;
    if (ps.availability === 'soldout') {
      verdict = 'unavailable';
      flags.push({ kind: 'soldout', key: 'ver.soldout', en: '{name}: sold out at source, hidden', vars: { name: x.name } });
    }
    if (ps.price !== x.price) {
      if (verdict !== 'unavailable') verdict = 'confirm';
      flags.push({ kind: 'price', key: 'ver.price', en: '{name}: price changed {from} → {to} at source, flagged Needs confirmation', vars: { name: x.name, from: OT.inr(x.price), to: OT.inr(ps.price) } });
    } else checks.push({ key: 'ver.priceOk', en: 'Price {price} matched in 2 sources', vars: { price: OT.inr(x.price) } });
    if (ps.rating == null && !ps.ratingNotApplicable) {
      if (verdict === 'verified') verdict = 'confirm';
      flags.push({ kind: 'rating', key: 'ver.rating', en: '{name}: rating missing at source, shown as unavailable', vars: { name: x.name } });
    } else if (ps.rating != null) checks.push({ key: 'ver.ratingOk', en: 'Rating {r} matched', vars: { r: ps.rating } });
    if (age > staleMs) {
      if (verdict === 'verified') verdict = 'confirm';
      flags.push({ kind: 'stale', key: 'ver.stale', en: '{name}: data {h} h old (> 6 h), re-check required', vars: { name: x.name, h: Math.round(age / 360000) / 10 } });
    } else checks.push({ key: 'ver.fresh', en: 'Checked {ago}', vars: { ago: agoLabel(srcAt) } });
    if (!x.policy) {
      if (verdict === 'verified') verdict = 'confirm';
      flags.push({ kind: 'policy', key: 'ver.policy', en: '{name}: cancellation policy not published, contact provider', vars: { name: x.name } });
    } else checks.push({ key: 'ver.policyOk', en: 'Cancellation policy present', vars: {} });
    if (ps.availability !== 'soldout') checks.push({ key: 'ver.availOk', en: 'Availability matched', vars: {} });
    return { item: x, verdict: verdict, flags: flags, checks: checks, livePrice: livePrice, sourceCheckedAt: srcAt, recheckedNow: !!rechecked[x.id] };
  };
  OT.agents.verify = function (records) { return records.map(function (r) { return OT.agents.verifyOne(r.item); }); };

  /* ---------------- Recommendation Agent ---------------- */
  function score(v, intent) {
    var x = v.item, s = 0, p = intent.prefs || {};
    s += (x.rating || 3.5) * 20;
    s -= (x.distanceKm || 0) * (intent.nearStation ? 2 : 1);
    if (v.verdict === 'verified') s += 15;
    if (p.freeCancel && x.policy && x.policy.fullUntilH >= 24) s += 8;
    if (p.veg && x.tags.indexOf('veg') >= 0) s += 6;
    if (p.family && x.tags.indexOf('family') >= 0) s += 4;
    if (p.temple && x.tags.indexOf('temple') >= 0) s += 6;
    if (x.availability === 'few') s -= 3;
    if (x.type === 'hotel' && intent.budget) s += Math.max(0, (intent.budget - v.livePrice) / intent.budget * 10);
    if (x.type === 'cab' && x.offsetMin != null) s += 12;            // station transfers first
    if (x.type === 'sight' && x.tags.indexOf('gapFill') >= 0) s += 6;
    return s;
  }
  function reasons(v, intent) {
    var x = v.item, r = [], p = intent.prefs || {};
    if (x.type === 'hotel' && intent.budget && v.livePrice <= intent.budget) r.push({ key: 'why.budget', en: 'Within {b}', vars: { b: OT.inr(intent.budget) } });
    if (x.distanceKm != null && x.distanceKm <= 2) r.push({ key: 'why.near', en: '{d} km from station', vars: { d: x.distanceKm } });
    if (x.policy && x.policy.fullUntilH >= 24) r.push({ key: 'why.freeCancel', en: 'Free cancellation till {h} h before', vars: { h: x.policy.fullUntilH } });
    if (p.veg && x.tags.indexOf('veg') >= 0) r.push({ key: 'why.veg', en: 'Matches: veg', vars: {} });
    if (x.rating >= 4.4) r.push({ key: 'why.rated', en: 'Rated {r}', vars: { r: x.rating } });
    if (x.managed === 'irctc') r.push({ key: 'why.irctc', en: 'IRCTC-managed', vars: {} });
    if (x.type === 'cab' && x.offsetMin != null) r.push({ key: 'why.transfer', en: 'Timed to your train arrival', vars: {} });
    if (x.tags.indexOf('gapFill') >= 0) r.push({ key: 'why.gap', en: 'Fits the arrival/check-in gap', vars: {} });
    if (p.temple && x.tags.indexOf('temple') >= 0) r.push({ key: 'why.temple', en: 'Matches: temple visit', vars: {} });
    return r;
  }
  OT.agents.recommend = function (verified, intent) {
    var byType = { hotel: [], cab: [], food: [], sight: [] }, hidden = [], filtered = [];
    var dismissed = (OT.state && OT.state.dismissed) || {};
    verified.forEach(function (v) {
      if (v.verdict === 'unavailable') { hidden.push({ v: v, reason: 'soldout' }); return; }
      if (v.item.type === 'hotel' && intent.budget && v.item.price > intent.budget && v.livePrice > intent.budget) { filtered.push({ v: v, reason: 'budget' }); return; }
      if (dismissed[v.item.id]) { filtered.push({ v: v, reason: 'dismissed' }); return; }
      v.score = score(v, intent); v.reasons = reasons(v, intent);
      byType[v.item.type].push(v);
    });
    Object.keys(byType).forEach(function (k) {
      var list = byType[k].sort(function (a, b) { return b.score - a.score; });
      // Sponsored guardrail: a verified sponsored item may rise at most ONE slot above its organic rank.
      for (var i = 1; i < list.length; i++) {
        if (list[i].item.sponsored && list[i].verdict === 'verified' && !list[i - 1].item.sponsored && !list[i].lifted) {
          var tmp = list[i - 1]; list[i - 1] = list[i]; list[i] = tmp; list[i - 1].lifted = true; i++;
        }
      }
      if (list[0]) list[0].top = true;
    });
    return { byType: byType, hidden: hidden, filtered: filtered };
  };

  /* ---------------- Itinerary Agent ---------------- */
  OT.agents.slotFor = function (x, j) {
    var tr = j.train, arrDate = tr.arrDate || tr.date, arrIso = dt(arrDate, tr.arr);
    if (x.type === 'hotel') return { when: dt(arrDate, x.checkIn), endWhen: dt(D().addDays(arrDate, j.nights || 1), x.checkOut) };
    if (x.type === 'cab' && x.offsetMin != null) return { when: addMinIso(arrIso, x.offsetMin), endWhen: addMinIso(arrIso, x.offsetMin + (x.durationMin || 20)) };
    if (x.type === 'food' && x.onTrain) return { when: dt(tr.date, x.slot) };
    var day = x.day || 0, base = D().addDays(arrDate, day);
    var w = dt(base, x.slot || '10:00');
    return { when: w, endWhen: x.durationMin ? addMinIso(w, x.durationMin) : undefined };
  };

  function activeItems(j) { return (j.items || []).filter(function (i) { return i.status !== 'cancelled'; }); }

  OT.agents.itinerary = function (j) {
    if (!j || !j.train) return { events: [], conflicts: [] };
    var tr = j.train, st = D().stations, L = OT.i18n ? OT.i18n.lang() : 'en';
    var arrDate = tr.arrDate || tr.date, arrIso = dt(arrDate, tr.arr), depIso = dt(tr.date, tr.dep);
    var ev = [];
    ev.push({ id: 'dep', kind: 'dep', when: depIso, station: tr.from, icon: 'train', seg: 'train',
      title: T('tl.depart', 'Depart {station}', { station: D().stationName(tr.from, L) }), sub: tr.no + ' ' + tr.name });
    var trn = D().trains[tr.no];
    (trn && trn.stops || []).forEach(function (s) {
      var food = activeItems(j).filter(function (i) { return i.type === 'food' && D().get(i.refId) && D().get(i.refId).onTrain; })[0];
      if (food) ev.push({ id: 'stop-' + s.code, kind: 'stop', when: dt(tr.date, s.arr), station: s.code, icon: 'food', seg: 'train', itemId: food.id,
        title: T('tl.mealOnboard', 'Meal delivered at {station}', { station: D().stationName(s.code, L) }), sub: food.title, item: food });
    });
    ev.push({ id: 'arr', kind: 'arr', when: arrIso, station: tr.to, icon: 'pin', seg: 'local',
      title: T('tl.arrive', 'Arrive {station}', { station: D().stationName(tr.to, L) }), sub: tr.no + ' · ' + T('tl.coach', 'Coach {c}', { c: tr.coach }) });

    activeItems(j).forEach(function (it) {
      var x = D().get(it.refId) || {};
      if (it.type === 'food' && x.onTrain) return;
      var when = it.when || null;
      if (it.type === 'hotel') {
        var ci = it.earlyCheckIn ? dt(arrDate, it.earlyTime || fromMin(toMin(tr.arr) + 30)) : when;
        ev.push({ id: it.id + '-in', kind: 'checkin', when: ci, icon: 'hotel', seg: 'local', itemId: it.id, item: it,
          title: T('tl.checkin', 'Check-in: {name}', { name: it.title }), sub: it.earlyCheckIn ? T('tl.earlyReq', 'Early check-in requested · awaiting hotel confirmation') : T('tl.stdCheckin', 'Standard check-in {t}', { t: x.checkIn || '' }) });
        if (it.endWhen) ev.push({ id: it.id + '-out', kind: 'checkout', when: it.endWhen, icon: 'hotel', seg: 'local', itemId: it.id, item: it,
          title: T('tl.checkout', 'Check-out: {name}', { name: it.title }), sub: '' });
        return;
      }
      var titles = { cab: T('tl.pickup', 'Pickup: {name}', { name: it.title }), food: T('tl.meal', 'Meal: {name}', { name: it.title }), sight: x.service === 'cloakroom' ? T('tl.cloak', 'Drop bags: {name}', { name: it.title }) : T('tl.visit', 'Visit: {name}', { name: it.title }) };
      ev.push({ id: it.id, kind: it.type, when: when, icon: it.type === 'sight' ? (x.service ? 'lock' : 'sight') : it.type, seg: 'local', itemId: it.id, item: it,
        title: titles[it.type] || it.title, sub: x.meet || x.area || '', unknownTime: !when });
    });
    if (j.returnTrain) {
      var r = j.returnTrain;
      ev.push({ id: 'rdep', kind: 'rdep', when: dt(r.date, r.dep), station: r.from, icon: 'train', seg: 'train',
        title: T('tl.return', 'Return train from {station}', { station: D().stationName(r.from, L) }), sub: r.no + ' ' + r.name + ' · PNR ' + r.pnr });
      var rt = D().trains[r.no];
      ev.push({ id: 'rarr', kind: 'rarr', when: dt(D().addDays(r.date, rt ? rt.arrOffset : 0), r.arr), station: r.to, icon: 'pin', seg: null,
        title: T('tl.home', 'Arrive {station}', { station: D().stationName(r.to, L) }), sub: r.no });
    }
    ev.sort(function (a, b) {
      if (!a.when) return 1; if (!b.when) return -1;
      return isoMs(a.when) - isoMs(b.when) || (a.kind === 'arr' ? -1 : b.kind === 'arr' ? 1 : 0);
    });
    // segment after the last node never draws
    if (ev.length) ev[ev.length - 1].seg = null;
    // train segment runs dep -> arr (and rdep -> rarr); everything else local
    var inTrain = false;
    ev.forEach(function (e) {
      if (e.kind === 'dep' || e.kind === 'rdep') inTrain = true;
      if (e.kind === 'arr' || e.kind === 'rarr') inTrain = false;
      if (e.seg !== null) e.seg = inTrain ? 'train' : 'local';
    });

    /* conflicts */
    var conflicts = [];
    var hotel = activeItems(j).filter(function (i) { return i.type === 'hotel'; })[0];
    if (hotel) {
      var hx = D().get(hotel.refId) || {};
      var arrM = toMin(tr.arr), ciM = toMin(hx.checkIn || '14:00');
      var gap = ciM - arrM;
      if (hotel.when && hotel.when.slice(0, 10) === arrDate && gap > 30) {
        var items = activeItems(j);
        var cloak = items.filter(function (i) { var x = D().get(i.refId); return x && x.service === 'cloakroom'; })[0];
        var fill = items.filter(function (i) {
          var x = D().get(i.refId); if (!x || i.type === 'hotel' || i.type === 'cab' || !i.when) return false;
          var m = isoMs(i.when); return m >= isoMs(arrIso) && m < isoMs(dt(arrDate, hx.checkIn)) && (x.tags.indexOf('gapFill') >= 0 || i.type === 'food');
        })[0];
        var how = hotel.earlyCheckIn ? 'early' : cloak ? 'cloak' : fill ? 'visit' : null;
        conflicts.push({ id: 'checkin-gap', kind: 'gap', arr: tr.arr, checkIn: hx.checkIn, gapMin: gap, resolved: !!how, how: how,
          hotelItemId: hotel.id, earlyFee: hx.earlyCheckIn ? hx.earlyCheckIn.fee : null, after: 'arr' });
      }
    }
    activeItems(j).forEach(function (it) {
      if (it.type === 'cab' && it.when && isoMs(it.when) < isoMs(arrIso) && D().get(it.refId) && D().get(it.refId).offsetMin != null) {
        conflicts.push({ id: 'cab-early-' + it.id, kind: 'cabEarly', itemId: it.id, resolved: false, after: it.id });
      }
      if (it.type !== 'food' && it.when && isoMs(it.when) < isoMs(arrIso) && it.type !== 'cab') {
        conflicts.push({ id: 'before-' + it.id, kind: 'beforeArrival', itemId: it.id, resolved: false, after: it.id });
      }
    });
    return { events: ev, conflicts: conflicts };
  };

  /* ---------------- Trip Readiness (weighted, explainable) ----------------
   * Ticket 30 · Stay 25 · Arrival transfer 20 · Meal 10 · Return 10 · Conflicts resolved 5.
   * Booked (confirmed) = 100% of weight, planned (selected) = 80%, any "Needs confirmation" = 50%.
   */
  OT.agents.READINESS_WEIGHTS = { ticket: 30, stay: 25, transfer: 20, meal: 10, ret: 10, conflicts: 5 };
  function credit(it) {
    if (!it) return { f: 0, state: 'missing' };
    if (it.verification === 'confirm') return { f: 0.5, state: 'confirm' };
    if (it.status === 'confirmed') return { f: 1, state: 'booked' };
    return { f: 0.8, state: 'planned' };
  }
  OT.agents.readiness = function (j) {
    var W = OT.agents.READINESS_WEIGHTS, parts = [];
    if (!j || !j.train) return { score: 0, parts: [] };
    var items = activeItems(j);
    var tf = j.train.status === 'CNF' ? 1 : j.train.status === 'RAC' ? 0.5 : 0;
    parts.push({ id: 'ticket', w: W.ticket, pts: W.ticket * tf, state: tf === 1 ? 'booked' : 'confirm' });
    function best(filter) {
      var c = items.filter(filter).map(credit).sort(function (a, b) { return b.f - a.f; })[0];
      return c || { f: 0, state: 'missing' };
    }
    var stay = best(function (i) { return i.type === 'hotel'; });
    parts.push({ id: 'stay', w: W.stay, pts: W.stay * stay.f, state: stay.state });
    var tr = best(function (i) { var x = D().get(i.refId); return i.type === 'cab' && x && x.offsetMin != null; });
    parts.push({ id: 'transfer', w: W.transfer, pts: W.transfer * tr.f, state: tr.state });
    var meal = best(function (i) { return i.type === 'food'; });
    parts.push({ id: 'meal', w: W.meal, pts: W.meal * meal.f, state: meal.state });
    parts.push({ id: 'ret', w: W.ret, pts: j.returnTrain ? W.ret : 0, state: j.returnTrain ? 'booked' : 'missing' });
    var conf = OT.agents.itinerary(j).conflicts, open = conf.filter(function (c) { return !c.resolved; }).length;
    parts.push({ id: 'conflicts', w: W.conflicts, pts: open ? 0 : W.conflicts, state: open ? 'open' : 'booked', open: open });
    var score = Math.round(parts.reduce(function (s, p) { return s + p.pts; }, 0));
    return { score: Math.min(100, score), parts: parts };
  };

  /* ---------------- Pricing + refund helpers ---------------- */
  OT.agents.lineFor = function (it, j) {
    var x = D().get(it.refId) || {}, pax = (j && j.passengers) || 1, qty = 1, unit = it.price;
    if (x.basis === 'night') qty = (j && j.nights) || 1;
    if (x.basis === 'person') qty = pax;
    if (x.basis === 'bag') qty = pax;
    var amount = unit * qty;
    if (it.earlyCheckIn && x.earlyCheckIn) amount += x.earlyCheckIn.fee;
    var gstRate = x.type === 'sight' ? (x.basis === 'person' && x.price >= 500 ? 0.18 : 0) : 0.05;
    var gst = Math.round(amount - amount / (1 + gstRate));
    return { unit: unit, qty: qty, basis: x.basis, amount: amount, gst: gst, gstRate: gstRate, early: it.earlyCheckIn && x.earlyCheckIn ? x.earlyCheckIn.fee : 0 };
  };
  /** Policy-based refund: booking -> {pct, amount, freeUntil, hoursLeft, policy} */
  OT.agents.refundFor = function (b, nowMs) {
    nowMs = nowMs || Date.now();
    var j = OT.store.get('journey'), it = j && (j.items || []).filter(function (i) { return i.id === b.itemId; })[0];
    var x = D().get(b.refId || (it && it.refId)) || {};
    var start = it && it.when ? isoMs(it.when) : (b.startAt ? isoMs(b.startAt) : nowMs + 7 * 86400000);
    var hoursLeft = (start - nowMs) / 3600000;
    var pol = x.policy;
    if (!pol) return { pct: null, amount: null, hoursLeft: hoursLeft, policy: null, start: start };
    var pct = hoursLeft >= pol.fullUntilH ? 100 : pol.thenPct;
    if (hoursLeft < 0) pct = 0;
    return { pct: pct, amount: Math.round(b.amount * pct / 100), hoursLeft: hoursLeft, policy: pol, start: start, freeUntil: start - pol.fullUntilH * 3600000 };
  };
  OT.agents.policyText = function (pol, lang) {
    var T = lang && OT.i18n ? function (k, fb, v) { return OT.i18n.tIn(lang, k, fb, v); } : function (k, fb, v) { return OT.t ? OT.t(k, fb, v) : fb; };
    if (!pol) return T('pol.none', 'Cancellation policy not published by provider. Contact provider before booking.');
    if (pol.fullUntilH === 0 && pol.thenPct === 0) return T('pol.payAtUse', 'Pay-at-use or no-refund item: cancel any time before use, nothing is charged in advance online (sample).');
    if (pol.fullUntilH === 0) return T('pol.flex', 'Fully refundable until use.');
    if (pol.thenPct === 0 && OT.i18n && OT.i18n.has('pol.strict', lang || OT.i18n.lang())) return T('pol.strict', 'Free cancellation until {h} h before start; no refund after that.', { h: pol.fullUntilH });
    return T('pol.std', 'Free cancellation until {h} h before start; after that {p}% refund.', { h: pol.fullUntilH, p: pol.thenPct });
  };

  /* ---------------- Customer Support Agent ---------------- */
  var SUP = {
    human: ['human', 'agent', 'person', 'complaint', 'इंसान', 'एजेंट', 'शिकायत', 'बात करा', 'व्यक्ति', 'माणूस', 'মানুষ', 'অভিযোগ', 'மனிதர்', 'புகார்', 'மனித', 'మనిషి', 'ఫిర్యాదు', 'ಮನುಷ್ಯ', 'ದೂರು', 'മനുഷ്യ', 'പരാതി', 'માણસ', 'ફરિયાદ', 'ਇਨਸਾਨ', 'ਸ਼ਿਕਾਇਤ', 'ମଣିଷ', 'ଅଭିଯୋଗ'],
    refund: ['refund', 'money back', 'रिफंड', 'रिफ़ंड', 'पैसा वापस', 'पैसे वापस', 'परतावा', 'রিফান্ড', 'ফেরত', 'ரீஃபண்ட்', 'திரும்ப', 'பணம்', 'రీఫండ్', 'వాపసు', 'ರೀಫಂಡ್', 'ಮರುಪಾವತಿ', 'റീഫണ്ട്', 'തിരികെ', 'રિફંડ', 'પૈસા પાછા', 'ਰਿਫੰਡ', 'ਵਾਪਸ', 'ରିଫଣ୍ଡ', 'ଫେରସ୍ତ'],
    cancel: ['cancel', 'कैंसल', 'रद्द', 'বাতিল', 'ரத்து', 'రద్దు', 'ರದ್ದು', 'റദ്ദ', 'રદ', 'ਰੱਦ', 'ବାତିଲ'],
    checkin: ['check-in', 'checkin', 'check in', 'early', 'cloak', 'luggage', 'चेक-इन', 'चेक इन', 'सामान', 'क्लोकरूम', 'চেক-ইন', 'லக்கேஜ்', 'செக்-இன்', 'చెక్-ఇన్', 'ಚೆಕ್-ಇನ್', 'ചെക്ക്-ഇൻ', 'ચેક-ઇન', 'ਚੈੱਕ-ਇਨ', 'ଚେକ୍-ଇନ୍'],
    pnr: ['pnr', 'पीएनआर', 'train', 'ट्रेन', 'गाड़ी', 'ট্রেন', 'ரயில்', 'రైలు', 'ರೈಲು', 'ട്രെയിൻ', 'ટ્રેન', 'ਟ੍ਰੇਨ', 'ଟ୍ରେନ', 'coach', 'seat'],
    status: ['status', 'booking', 'स्टेटस', 'स्थिति', 'स्थिती', 'बुकिंग', 'অবস্থা', 'বুকিং', 'நிலை', 'முன்பதிவு', 'బుకింగ్', 'స్థితి', 'ಬುಕಿಂಗ್', 'ಸ್ಥಿತಿ', 'ബുക്കിംഗ്', 'സ്ഥിതി', 'બુકિંગ', 'સ્થિતિ', 'ਬੁਕਿੰਗ', 'ਸਥਿਤੀ', 'ବୁକିଂ', 'ସ୍ଥିତି']
  };
  OT.agents.supportIntent = function (text) {
    var t = String(text || '').toLowerCase();
    var order = ['human', 'refund', 'cancel', 'checkin', 'pnr', 'status'];
    for (var i = 0; i < order.length; i++) if (has(t, SUP[order[i]])) return order[i];
    return null;
  };
  function cite(topic) { return D().policies.filter(function (p) { return p.topic === topic; }).map(function (p) { return { id: p.id, title: p.title }; }); }
  OT.agents.createTicket = function (o) {
    var id = 'SUP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    var tk = { id: id, createdAt: new Date().toISOString(), lang: o.lang || (OT.i18n ? OT.i18n.lang() : 'en'), category: o.category || 'general',
      subject: o.subject || 'Assistant escalation', message: o.message || '', bookingRef: o.bookingRef || null, status: 'open', source: o.source || 'assistant',
      user: (OT.store.get('user') || {}).email || 'guest', priority: o.priority || 'normal', slaHours: 2 };
    OT.store.update('tickets', function (l) { return (l || []).concat([tk]); });
    return tk;
  };

  OT.agents.support = function (text, opts) {
    opts = opts || {};
    var lang = opts.lang || (OT.i18n ? OT.i18n.lang() : 'en');
    var intent = opts.intent || OT.agents.supportIntent(text);
    var j = OT.store.get('journey'), bookings = OT.store.get('bookings', []) || [];
    var tr = j && j.train;
    var mine = bookings.filter(function (b) { return !j || b.journeyId === j.id; });
    var live = mine.filter(function (b) { return b.status === 'confirmed'; });
    var cancelled = mine.filter(function (b) { return b.cancellation; });
    var ticket = intent === 'human' ? OT.agents.createTicket({ lang: lang, category: 'escalation', subject: 'Traveller asked for a human', message: text }) : null;
    var usedKey = null;

    /* Build the answer in a given language (so we can show the English original next to it). */
    function make(LG) {
      function TL(k, fb, v) { if (LG === lang && !usedKey) usedKey = k; return OT.i18n ? OT.i18n.tIn(LG, k, fb, v) : fb; }
      function S(k, fb) { return OT.i18n ? OT.i18n.tIn(LG, k, fb) : fb; }
      var st = tr ? S('trainStatus.' + tr.status, tr.status) : '';
      var r = { actions: [], citations: [], text: null };
      if (intent === 'human') {
        r.text = TL('support.escalated', 'I have created ticket {ticket} for a human agent. They will reply in {lang} within 2 hours (sample SLA).', { ticket: ticket.id, lang: OT.lang ? OT.lang.info(lang).native : lang });
        r.citations = cite('human');
      } else if (!j && intent) {
        r.text = TL('support.noJourney', 'I could not find a trip yet. Plan a trip first, or import the sample PNR on the home page.');
        r.actions.push({ label: S('nav.plan', 'Plan trip'), route: 'home' });
      } else if (intent === 'refund') {
        r.citations = cite('refund');
        if (cancelled.length) {
          var c = cancelled[cancelled.length - 1];
          r.text = TL('support.refund', 'Refund of {amount} for {title} ({ref}) is {rstatus}. It goes back to your original payment method by {eta} (Partner Bank, sample).', {
            amount: OT.inr(c.cancellation.refundAmount), title: c.title, ref: c.ref, rstatus: S('status.' + (c.cancellation.status === 'refunded' ? 'refunded' : 'processing'), c.cancellation.status), eta: fmtDate(c.cancellation.eta) });
          r.actions.push({ label: S('asst.trackRefund', 'Track refund'), route: 'bookings' });
        } else {
          r.text = TL('support.refundNone', 'No refund is in progress. If you cancel inside the free window, the full amount goes back to your original payment method in 5–7 working days. Train ticket refunds happen on IRCTC under railway rules.');
        }
        r.critical = true;
      } else if (intent === 'cancel') {
        r.citations = cite('cancel');
        if (live.length) {
          var b = live[0], rf = OT.agents.refundFor(b);
          r.text = TL('support.cancel', 'You can cancel {title} ({ref}). Policy: {policy} Estimated refund: {amount}. I will not cancel anything without your confirmation.', {
            title: b.title, ref: b.ref, policy: OT.agents.policyText(rf.policy, LG), amount: rf.amount == null ? S('common.unavailable', 'Unavailable') : OT.inr(rf.amount) });
          r.actions.push({ label: S('asst.openBookings', 'Review & cancel in Bookings'), route: 'bookings' });
        } else {
          r.text = TL('support.cancelNone', 'There is no confirmed OneTrip booking to cancel yet. Your train ticket is cancelled on IRCTC, not here.');
        }
        r.critical = true;
      } else if (intent === 'checkin') {
        r.citations = cite('checkin');
        var hx = (j.items || []).filter(function (i) { return i.type === 'hotel' && i.status !== 'cancelled'; })[0];
        var hci = hx && D().get(hx.refId) ? D().get(hx.refId).checkIn : '14:00';
        r.text = TL('support.checkin', 'Your train arrives at {arr}; standard check-in is {checkin}. Early check-in needs hotel confirmation. Meanwhile the station cloakroom costs {fee} per bag (sample).', { arr: tr.arr, checkin: hci, fee: OT.inr(30) });
        r.actions.push({ label: S('nav.journey', 'My Journey'), route: 'journey' });
      } else if (intent === 'pnr') {
        r.citations = cite('train');
        r.text = TL('support.pnr', 'PNR {pnr}: train {train} {name}, {from} {dep} → {to} {arr} on {date}, coach {coach}, seats {seats}, status {status} (sample, not live).', {
          pnr: j.pnr, train: tr.no, name: tr.name, from: tr.from, dep: tr.dep, to: tr.to, arr: tr.arr, date: fmtDate(tr.date), coach: tr.coach, seats: tr.seats.join(', '), status: st });
      } else if (intent === 'status') {
        if (mine.length) {
          var list = mine.map(function (b) { return b.title + ' (' + b.ref + '): ' + S('status.' + b.status, b.status); }).join('; ');
          r.text = TL('support.status', 'You have {n} OneTrip booking(s): {list}. Your train {train} (PNR {pnr}) is {tstatus} (sample).', { n: mine.length, list: list, train: tr.no, pnr: j.pnr, tstatus: st });
        } else {
          r.text = TL('support.statusNone', 'No OneTrip bookings yet. Your train {train} (PNR {pnr}) is {tstatus} (sample). Add a hotel or cab from Plan trip.', { train: tr.no, pnr: j.pnr, tstatus: st });
        }
        r.actions.push({ label: S('nav.bookings', 'Bookings & refunds'), route: 'bookings' });
      }
      return r;
    }

    var a = make(lang);
    if (a.text) {
      var en = lang === 'en' ? a : make('en');
      var covered = lang === 'en' || !usedKey || (OT.i18n && OT.i18n.has(usedKey, lang));
      return Promise.resolve(Object.assign({ intent: intent, lang: lang, engine: 'rules', escalated: !!ticket, ticket: ticket,
        confidence: covered ? 0.94 : 0.5, fellBack: !covered }, a, { textEn: en.text }));
    }

    // Not matched by rules: try Gemini (grounded on the user's own data), else low-confidence fallback + escalation offer.
    var fbText = OT.i18n ? OT.i18n.tIn(lang, 'support.fallback', 'I am not fully sure I understood. I can help with booking status, cancellation, refunds and PNR. Shall I connect you to a human agent?') : '';
    var fallback = {
      intent: null, lang: lang, confidence: 0.35, engine: 'rules', citations: [], escalateOffer: true, text: fbText,
      textEn: OT.i18n ? OT.i18n.tIn('en', 'support.fallback', 'I am not fully sure I understood. I can help with booking status, cancellation, refunds and PNR. Shall I connect you to a human agent?') : fbText,
      actions: [{ label: T('asst.human', 'Talk to a human'), escalate: true }]
    };
    if (!(OT.gemini && OT.gemini.available())) return Promise.resolve(fallback);
    var ctx = {
      trip: j ? { pnr: j.pnr, train: tr, passengers: j.passengers, items: (j.items || []).map(function (i) { return { title: i.title, type: i.type, price: i.price, when: i.when, status: i.status }; }) } : null,
      bookings: mine.map(function (b) { return { ref: b.ref, title: b.title, amount: b.amount, status: b.status, cancellation: b.cancellation || null }; }),
      policies: D().policies.map(function (p) { return p.title + ': ' + p.text; })
    };
    var lname = OT.lang ? OT.lang.info(lang).name : lang;
    var prompt = 'Traveller message (language: ' + lname + '):\n' + text + '\n\nTrip and booking data (sample, the only source of truth):\n' + JSON.stringify(ctx) +
      '\n\nReply in ' + lname + ' in at most 3 short sentences. Use ONLY the data above; never invent prices, times, availability or policies. ' +
      'If the data does not answer the question, say so and offer a human agent. Keep PNR, train numbers, ₹ amounts, dates and booking refs exactly as written.';
    return OT.gemini.generate(prompt, { system: 'You are the IRCTC OneTrip Customer Support Agent in an academic prototype with simulated data.', timeoutMs: 15000, temperature: 0.2 })
      .then(function (out) {
        var txt = String(out).trim();
        // guardrail: every ₹ amount in the reply must exist in the data we sent
        var ctxStr = JSON.stringify(ctx);
        var amounts = (txt.match(/₹\s?[\d,]+/g) || []).map(function (x) { return x.replace(/[₹,\s]/g, ''); });
        var invented = amounts.filter(function (a) { return ctxStr.indexOf(a) < 0; });
        if (invented.length) return fallback;
        return { intent: 'llm', lang: lang, confidence: 0.8, engine: 'gemini', text: txt, citations: cite('cancel').concat(cite('refund')).slice(0, 2),
          actions: [{ label: T('asst.human', 'Talk to a human'), escalate: true }] };
      })
      .catch(function () { return fallback; });
  };

  /* ---------------- Partner Agent (used by Builder B's enquiries inbox) ---------------- */
  OT.agents.partnerDraftReply = function (enq) {
    enq = enq || {};
    var msg = String(enq.message || enq.text || enq.question || '');
    var lang = enq.lang || (OT.lang ? OT.lang.detect(msg).code : 'en');
    var guest = enq.guestName || enq.guest || enq.name || 'Guest';
    var listing = enq.listing || enq.hotel || enq.property || 'our property';
    var date = enq.checkIn || enq.date || '';
    var pax = enq.pax || enq.guests || '';
    var t = msg.toLowerCase();
    var topic = /early|जल्दी|अर्ली|चेक-इन|check-in|checkin|সকাল|காலை/.test(t) ? 'early' : /price|rate|discount|दाम|कीमत|किराया|দাম|விலை/.test(t) ? 'price' :
      /veg|शाकाहारी|जैन|jain|নিরামিষ|சைவ/.test(t) ? 'veg' : /park|पार्किंग/.test(t) ? 'parking' : 'avail';
    var en = {
      early: 'Namaste {guest}, thank you for choosing {listing}. Early check-in on {date} depends on the previous night\'s occupancy; we will confirm by 9 PM the day before. Meanwhile you are welcome to leave luggage at our desk free of charge.',
      price: 'Namaste {guest}, thank you for your enquiry. The rate shown on OneTrip is our current all-inclusive price (GST included); we do not add any hidden fees at check-in.',
      veg: 'Namaste {guest}, yes, our kitchen serves pure-veg meals and can prepare Jain food on request. Please mention it at booking.',
      parking: 'Namaste {guest}, free parking is available for one car per room, subject to space.',
      avail: 'Namaste {guest}, thank you for your enquiry about {listing}{forDate}. Rooms are available as per our OneTrip calendar{forPax}. You can book directly on OneTrip; free cancellation applies as listed.'
    }[topic];
    var hi = {
      early: 'नमस्ते {guest}, {listing} चुनने के लिए धन्यवाद। {date} को अर्ली चेक-इन पिछली रात की बुकिंग पर निर्भर है; हम एक दिन पहले रात 9 बजे तक पुष्टि करेंगे। तब तक आप सामान हमारे रिसेप्शन पर निःशुल्क रख सकते हैं।',
      price: 'नमस्ते {guest}, आपकी पूछताछ के लिए धन्यवाद। OneTrip पर दिखाया गया रेट GST सहित पूरा मूल्य है; चेक-इन पर कोई छिपा शुल्क नहीं।',
      veg: 'नमस्ते {guest}, हाँ, हमारी रसोई में शुद्ध शाकाहारी भोजन मिलता है और अनुरोध पर जैन भोजन भी।',
      parking: 'नमस्ते {guest}, प्रति कमरा एक कार की निःशुल्क पार्किंग उपलब्ध है (जगह के अनुसार)।',
      avail: 'नमस्ते {guest}, {listing} के बारे में पूछताछ के लिए धन्यवाद। हमारे OneTrip कैलेंडर के अनुसार कमरे उपलब्ध हैं। आप सीधे OneTrip पर बुक कर सकते हैं।'
    }[topic];
    function fill(s, hiText) {
      return s.replace(/\{guest\}/g, guest).replace(/\{listing\}/g, listing).replace(/\{date\}/g, date || (hiText ? 'आपकी तारीख' : 'your date'))
        .replace(/\{forDate\}/g, date ? ' for ' + date : '').replace(/\{forPax\}/g, pax ? ' for ' + pax + ' guests' : '');
    }
    var textEn = fill(en);
    var out = { text: lang === 'hi' ? fill(hi, true) : textEn, textEn: textEn, lang: lang === 'hi' ? 'hi' : 'en', topic: topic, confidence: lang === 'hi' || lang === 'en' ? 0.9 : 0.6,
      agent: 'Partner Agent', note: 'Draft by Partner Agent (simulated). Review before sending; it never promises prices or availability not in your listing.' };
    if (lang !== 'hi' && lang !== 'en') out.note += ' Reply drafted in English: ' + (OT.lang ? OT.lang.info(lang).name : lang) + ' drafting needs live NMT.';
    out.toString = function () { return out.text; };
    return out;
  };
})();
