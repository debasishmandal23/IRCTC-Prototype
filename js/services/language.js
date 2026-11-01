/* IRCTC OneTrip — "BHASHINI-ready language layer (SIMULATED)".
 *
 * This is NOT a live BHASHINI integration (that needs registration/approval). The functions are
 * named after BHASHINI tasks so a real pipeline could replace them one by one:
 *   ASR            -> OT.lang.listen()        (browser Web Speech API, if present)
 *   TTS            -> OT.lang.speak()         (browser speechSynthesis, if a matching voice exists)
 *   Lang detection -> OT.lang.detect()        (Unicode script ranges + marker words)
 *   NMT            -> OT.lang.translate()     (Gemini if a key is set, else curated phrasebook)
 *   Transliteration-> OT.lang.transliterate() (romanised -> native script word map)
 * Translation safeguards: OT.lang.protectTokens()/restoreTokens() keep PNR, train no., station codes,
 * ₹ amounts, dates, times and booking refs out of translation; OT.lang.highlight() renders them
 * as <bdi class="keep" translate="no">.
 * Everything is feature-detected and never throws.
 */
(function () {
  'use strict';
  var OT = window.OT;

  function T(k, fb, v) { return OT.t ? OT.t(k, fb, v) : fb; }
  function langInfo(code) {
    var list = (OT.i18n && OT.i18n.languages) || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i];
    return { code: code || 'en', name: code || 'English', native: code || 'English', bcp47: 'en-IN' };
  }
  function curLang() { return OT.i18n ? OT.i18n.lang() : 'en'; }

  /* ---------------- Script ranges / detection ---------------- */
  var SCRIPTS = [
    { script: 'Deva', lo: 0x0900, hi: 0x097F, lang: 'hi' },
    { script: 'Beng', lo: 0x0980, hi: 0x09FF, lang: 'bn' },
    { script: 'Guru', lo: 0x0A00, hi: 0x0A7F, lang: 'pa' },
    { script: 'Gujr', lo: 0x0A80, hi: 0x0AFF, lang: 'gu' },
    { script: 'Orya', lo: 0x0B00, hi: 0x0B7F, lang: 'or' },
    { script: 'Taml', lo: 0x0B80, hi: 0x0BFF, lang: 'ta' },
    { script: 'Telu', lo: 0x0C00, hi: 0x0C7F, lang: 'te' },
    { script: 'Knda', lo: 0x0C80, hi: 0x0CFF, lang: 'kn' },
    { script: 'Mlym', lo: 0x0D00, hi: 0x0D7F, lang: 'ml' }
  ];
  var MR_MARK = /(आहे|आहेत|मला|पाहिजे|हवे|हवा|हवी|जवळ|च्या|नाही|कधी|माझे|माझा|माझी|ळ)/g;
  var HI_MARK = /(है|हैं|मुझे|चाहिए|के पास|का |की |नहीं|कब|मेरा|मेरी|तक)/g;
  var HINGLISH = /\b(mujhe|chahiye|chahie|hai|kya|ke paas|kitna|kab|mera|meri|rupaye|hazaar|hazar|kahan|batao|karna|wala)\b/i;

  function detect(text) {
    text = String(text || '');
    var counts = {}, letters = 0;
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) { counts.Latn = (counts.Latn || 0) + 1; letters++; continue; }
      for (var s = 0; s < SCRIPTS.length; s++) {
        if (c >= SCRIPTS[s].lo && c <= SCRIPTS[s].hi) { counts[SCRIPTS[s].script] = (counts[SCRIPTS[s].script] || 0) + 1; letters++; break; }
      }
    }
    if (!letters) return { code: curLang(), script: null, confidence: 0, romanised: false };
    var best = null, bestN = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > bestN) { best = k; bestN = counts[k]; } });
    var share = bestN / letters;
    if (best === 'Latn') {
      if (HINGLISH.test(text)) return { code: 'hi', script: 'Latn', confidence: 0.7, romanised: true };
      return { code: 'en', script: 'Latn', confidence: Math.min(0.97, 0.6 + share * 0.37), romanised: false };
    }
    var code = SCRIPTS.filter(function (s) { return s.script === best; })[0].lang;
    var conf = 0.75 + share * 0.2;
    if (best === 'Deva') {
      var mr = (text.match(MR_MARK) || []).length, hi = (text.match(HI_MARK) || []).length;
      if (mr > hi) { code = 'mr'; conf = 0.7 + Math.min(0.25, mr * 0.06); }
      else { conf = 0.72 + Math.min(0.25, hi * 0.06); }
    }
    return { code: code, script: best, confidence: Math.round(Math.min(0.98, conf) * 100) / 100, romanised: false };
  }

  /* Native digits -> ASCII digits (all 9 Indic scripts share the 0x?66 offset pattern). */
  var DIGIT_BASES = [0x0966, 0x09E6, 0x0A66, 0x0AE6, 0x0B66, 0x0BE6, 0x0C66, 0x0CE6, 0x0D66];
  function normDigits(text) {
    return String(text || '').replace(/[०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯]/g, function (ch) {
      var c = ch.charCodeAt(0);
      for (var i = 0; i < DIGIT_BASES.length; i++) if (c >= DIGIT_BASES[i] && c <= DIGIT_BASES[i] + 9) return String(c - DIGIT_BASES[i]);
      return ch;
    });
  }

  /* ---------------- Protected tokens ---------------- */
  var MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
  var TOKEN_RE = new RegExp([
    '\\b(?:OT|SIM|SUP|TXN|JRN)-[A-Z0-9]{2,}(?:-[A-Z0-9]+)*\\b',      // booking refs / tickets / txn ids
    '₹\\s?\\d[\\d,]*(?:\\.\\d+)?',                                     // rupee amounts
    '\\b\\d{10}\\b',                                                    // PNR
    '\\b\\d{4}-\\d{2}-\\d{2}\\b',                                       // ISO dates
    '\\b\\d{1,2} (?:' + MONTHS + ')[a-z]*,? \\d{4}\\b',                 // 14 Nov 2026
    '\\b\\d{1,2} (?:' + MONTHS + ')\\b',                                // 14 Nov
    '\\b\\d{1,2}:\\d{2}\\b',                                            // times
    '\\b\\d{5}\\b',                                                     // train numbers
    '\\b(?:NDLS|CDG|MDU|HWH|PURI|UMB|MS)\\b',                           // station codes (sample set)
    '\\bP-\\d{3}\\b'                                                    // partner ids
  ].join('|'), 'g');

  function protectTokens(text) {
    var tokens = [];
    var out = String(text == null ? '' : text).replace(TOKEN_RE, function (m) { tokens.push(m); return '⟦' + (tokens.length - 1) + '⟧'; });
    return { text: out, tokens: tokens };
  }
  function restoreTokens(text, tokens) {
    return String(text == null ? '' : text).replace(/⟦\s*(\d+)\s*⟧/g, function (m, i) { return tokens[+i] != null ? tokens[+i] : m; });
  }
  function tokensOf(text) { return (String(text || '').match(TOKEN_RE) || []); }
  /** Escape text and wrap protected tokens in <bdi class="keep" translate="no">. */
  function highlight(text) {
    var s = String(text == null ? '' : text), out = '', last = 0, m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(s))) {
      out += OT.esc(s.slice(last, m.index)) + '<bdi class="keep" translate="no">' + OT.esc(m[0]) + '</bdi>';
      last = m.index + m[0].length;
    }
    TOKEN_RE.lastIndex = 0;
    return out + OT.esc(s.slice(last));
  }
  /** Wrap one known value as a protected token (already-safe HTML out). */
  function keep(v) { return '<bdi class="keep" translate="no">' + OT.esc(v) + '</bdi>'; }

  /* ---------------- Transliteration (romanised -> native) ---------------- */
  var TRANSLIT = {
    hi: {
      mujhe: 'मुझे', muje: 'मुझे', chahiye: 'चाहिए', chahie: 'चाहिए', chaiye: 'चाहिए', hotel: 'होटल', chandigarh: 'चंडीगढ़', station: 'स्टेशन', railway: 'रेलवे',
      ke: 'के', paas: 'पास', pass: 'पास', tak: 'तक', ka: 'का', ki: 'की', ko: 'को', se: 'से', me: 'में', mein: 'में', rupaye: 'रुपये', rupay: 'रुपये', rupees: 'रुपये', rs: 'रुपये',
      hazaar: 'हज़ार', hazar: 'हज़ार', hajar: 'हजार', hajaar: 'हजार', sau: 'सौ', ek: 'एक', do: 'दो', teen: 'तीन', tin: 'तीन', char: 'चार', chaar: 'चार', paanch: 'पाँच', panch: 'पाँच',
      sasta: 'सस्ता', sasti: 'सस्ती', kamra: 'कमरा', taxi: 'टैक्सी', cab: 'कैब', gaadi: 'गाड़ी', khana: 'खाना', nashta: 'नाश्ता', thali: 'थाली', mandir: 'मंदिर',
      ghumna: 'घूमना', ghoomna: 'घूमना', kab: 'कब', mera: 'मेरा', meri: 'मेरी', mere: 'मेरे', refund: 'रिफंड', booking: 'बुकिंग', cancel: 'कैंसल', kya: 'क्या', hai: 'है', hain: 'हैं',
      aur: 'और', raat: 'रात', din: 'दिन', subah: 'सुबह', shaam: 'शाम', kal: 'कल', aaj: 'आज', delhi: 'दिल्ली', dilli: 'दिल्ली', nayi: 'नई', wala: 'वाला', wali: 'वाली',
      achha: 'अच्छा', accha: 'अच्छा', sabse: 'सबसे', nazdeek: 'नज़दीक', najdik: 'नज़दीक', kitna: 'कितना', kitne: 'कितने', kaise: 'कैसे', kahan: 'कहाँ', batao: 'बताओ',
      bataiye: 'बताइए', karna: 'करना', karo: 'करो', kijiye: 'कीजिए', paisa: 'पैसा', paise: 'पैसे', wapas: 'वापस', vapas: 'वापस', ticket: 'टिकट', train: 'ट्रेन', yatra: 'यात्रा',
      parivar: 'परिवार', shakahari: 'शाकाहारी', veg: 'वेज', chekin: 'चेक-इन', checkin: 'चेक-इन', jaldi: 'जल्दी', samaan: 'सामान', saman: 'सामान', madad: 'मदद', insaan: 'इंसान', baat: 'बात'
    },
    ta: { enakku: 'எனக்கு', hotel: 'ஹோட்டல்', vendum: 'வேண்டும்', madurai: 'மதுரை', arugil: 'அருகில்', aruge: 'அருகே', rayil: 'ரயில்', nilaiyam: 'நிலையம்', station: 'ஸ்டேஷன்', rubai: 'ரூபாய்', ayiram: 'ஆயிரம்', kovil: 'கோவில்', sappadu: 'சாப்பாடு', taxi: 'டாக்ஸி' },
    bn: { amar: 'আমার', ami: 'আমি', hotel: 'হোটেল', chai: 'চাই', puri: 'পুরী', kache: 'কাছে', station: 'স্টেশন', taka: 'টাকা', hajar: 'হাজার', modhye: 'মধ্যে', mandir: 'মন্দির', khabar: 'খাবার', taxi: 'ট্যাক্সি' }
  };
  function transliterate(text, lang) {
    lang = lang || 'hi';
    var map = TRANSLIT[lang];
    if (!map) return { text: text, changed: false, supported: false };
    var changed = false;
    var out = String(text || '').replace(/[A-Za-z]+/g, function (w) {
      var lw = w.toLowerCase();
      if (/^(pnr|cdg|ndls|mdu|hwh|upi)$/.test(lw)) return w; // keep codes
      if (map[lw]) { changed = true; return map[lw]; }
      return w;
    });
    return { text: out, changed: changed, supported: true };
  }

  /* ---------------- NMT (simulated phrasebook, Gemini when configured) ---------------- */
  var SAMPLES = {
    hi: 'मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए।',
    ta: 'எனக்கு மதுரை ரயில் நிலையம் அருகே இரண்டாயிரம் ரூபாய்க்குள் ஹோட்டல் வேண்டும்.',
    bn: 'আমার পুরী স্টেশনের কাছে আড়াই হাজার টাকার মধ্যে একটা হোটেল চাই।',
    en: 'I need a hotel near Chandigarh railway station up to 3,000 rupees.'
  };
  var PHRASEBOOK = [
    { lang: 'hi', src: SAMPLES.hi, en: 'I need a hotel near Chandigarh railway station up to ₹3,000.' },
    { lang: 'ta', src: SAMPLES.ta, en: 'I need a hotel near Madurai railway station within ₹2,000.' },
    { lang: 'bn', src: SAMPLES.bn, en: 'I want a hotel near Puri station within ₹2,500.' },
    { lang: 'hi', src: 'मेरा रिफंड कब आएगा?', en: 'When will my refund arrive?' },
    { lang: 'hi', src: 'मेरी बुकिंग का स्टेटस क्या है?', en: 'What is the status of my booking?' },
    { lang: 'hi', src: 'मुझे होटल कैंसल करना है', en: 'I want to cancel the hotel.' },
    { lang: 'ta', src: 'என் பணம் எப்போது திரும்ப வரும்?', en: 'When will my money come back?' },
    { lang: 'bn', src: 'আমার রিফান্ড কবে আসবে?', en: 'When will my refund arrive?' }
  ];
  function normPhrase(s) { return String(s || '').replace(/[।.?!,\s]+/g, ' ').trim().toLowerCase(); }

  function translate(text, from, to, opts) {
    opts = opts || {};
    text = String(text || '');
    from = from || detect(text).code; to = to || 'en';
    var base = { original: text, from: from, to: to };
    if (!text.trim() || from === to) return Promise.resolve(Object.assign(base, { text: text, confidence: 1, engine: 'none' }));

    function fallback(reason) {
      var n = normPhrase(text);
      for (var i = 0; i < PHRASEBOOK.length; i++) {
        var p = PHRASEBOOK[i];
        if (to === 'en' && normPhrase(p.src) === n) return Object.assign(base, { text: p.en, confidence: 0.96, engine: 'phrasebook', note: reason });
        if (from === 'en' && p.lang === to && normPhrase(p.en) === n) return Object.assign(base, { text: p.src, confidence: 0.96, engine: 'phrasebook', note: reason });
      }
      if (to === 'en' && opts.intent && OT.agents && OT.agents.intentToEnglish) {
        return Object.assign(base, { text: OT.agents.intentToEnglish(opts.intent), confidence: 0.74, engine: 'intent-template', note: reason });
      }
      return Object.assign(base, { text: text, confidence: 0.3, engine: 'unavailable', untranslated: true, note: reason });
    }

    if (!(OT.gemini && OT.gemini.available()) || opts.noLLM) return Promise.resolve(fallback('simulated'));
    var p = protectTokens(text);
    var prompt = 'Translate from ' + langInfo(from).name + ' to ' + langInfo(to).name + '. Keep every placeholder like ⟦0⟧ exactly as-is. ' +
      'Return only the translation, no notes.\n\n' + p.text;
    return OT.gemini.generate(prompt, { system: 'You are a careful translator for Indian Railways travellers. Never change numbers, codes or placeholders.', timeoutMs: 12000, temperature: 0.1 })
      .then(function (out) {
        var restored = restoreTokens(String(out).trim(), p.tokens);
        var missing = p.tokens.filter(function (t) { return restored.indexOf(t) < 0; });
        if (missing.length) return fallback('token-mismatch');
        return Object.assign(base, { text: restored, confidence: 0.9, engine: 'gemini' });
      })
      .catch(function () { return fallback('llm-error'); });
  }

  /** Translated text block with confidence chip + "show original" toggle. */
  function translatedBlock(o) {
    var conf = o.confidence == null ? 1 : o.confidence;
    var lvl = conf >= 0.85 ? 'hi' : conf >= 0.6 ? 'mid' : 'lo';
    var engines = {
      gemini: T('tb.gemini', 'Gemini NMT'), phrasebook: T('tb.phrasebook', 'Curated phrasebook'), template: T('tb.template', 'Reviewed template'),
      'intent-template': T('tb.intent', 'Intent-based rendering'), none: T('tb.same', 'Original'), unavailable: T('tb.unavail', 'Not translated')
    };
    var showOrig = o.original && o.original !== o.text;
    var low = conf < 0.6;
    return '<div class="tblock' + (low ? ' tb-low' : '') + '" data-tblock>' +
      '<div class="tb-main" lang="' + OT.esc(o.lang || curLang()) + '">' + highlight(o.text) + '</div>' +
      (showOrig ? '<div class="tb-orig" hidden lang="' + OT.esc(o.origLang || 'en') + '"><span class="xs muted">' + OT.esc(T('tb.originalLabel', 'Original')) + ' (' + OT.esc(langInfo(o.origLang || 'en').name) + '):</span> ' + highlight(o.original) + '</div>' : '') +
      '<div class="tb-meta"><span class="conf conf-' + lvl + '" title="' + OT.esc(T('tb.confTitle', 'Translation confidence (simulated estimate)')) + '">' +
      OT.icon('globe', 12) + ' ' + OT.esc(engines[o.engine] || o.engine || '') + ' · ' + OT.esc(T('tb.conf', 'confidence')) + ' ' + Math.round(conf * 100) + '%</span>' +
      (showOrig ? '<button type="button" class="btn-link xs" data-toggle-original>' + OT.esc(T('tb.showOrig', 'Show original')) + '</button>' : '') +
      (low ? '<span class="xs tb-warn">' + OT.icon('alert', 12) + ' ' + OT.esc(T('tb.lowConf', 'Low confidence: original shown; a human can help.')) + '</span>' : '') +
      '</div></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-toggle-original]');
    if (!b) return;
    var blk = b.closest('[data-tblock]'), o = blk && blk.querySelector('.tb-orig');
    if (!o) return;
    o.hidden = !o.hidden;
    b.textContent = o.hidden ? T('tb.showOrig', 'Show original') : T('tb.hideOrig', 'Hide original');
  });

  /* ---------------- ASR (speech -> text) ---------------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var activeRec = null;
  function asrMessage(code, lang) {
    var n = langInfo(lang).name;
    var m = {
      unsupported: T('voice.noAsr', 'Voice input is not supported in this browser. Use Chrome or Edge, or try a sample voice query.'),
      'not-allowed': T('voice.denied', 'Microphone permission was blocked. Allow the mic in your browser, or try a sample voice query.'),
      'service-not-allowed': T('voice.denied', 'Microphone permission was blocked. Allow the mic in your browser, or try a sample voice query.'),
      'no-speech': T('voice.noSpeech', 'We did not hear anything. Tap the mic and speak again.'),
      'audio-capture': T('voice.noMic', 'No microphone was found on this device. Try a sample voice query.'),
      network: T('voice.network', 'Speech service needs an internet connection. Try a sample voice query.'),
      'language-not-supported': T('voice.langAsr', 'Speech recognition for {lang} is not available in this browser. Type instead, or try a sample.', { lang: n })
    };
    return m[code] || T('voice.error', 'Voice input stopped. Try again or type your query.');
  }
  function listen(opts) {
    opts = opts || {};
    var lang = opts.lang || curLang();
    function fail(code) { try { opts.onError && opts.onError({ code: code, message: asrMessage(code, lang) }); } catch (e) { console.error(e); } try { opts.onEnd && opts.onEnd(); } catch (e2) { /* ignore */ } }
    if (!SR) { fail('unsupported'); return null; }
    stopListening();
    var rec;
    try { rec = new SR(); } catch (e) { fail('unsupported'); return null; }
    rec.lang = langInfo(lang).bcp47;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    var finalText = '', errored = false;
    rec.onresult = function (ev) {
      var interim = '', conf = 0.9;
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var r = ev.results[i];
        if (r.isFinal) { finalText += r[0].transcript; conf = r[0].confidence || conf; } else interim += r[0].transcript;
      }
      try { if (interim && opts.onInterim) opts.onInterim(finalText + interim); } catch (e) { console.error(e); }
      if (finalText && opts.onResult) { try { opts.onResult(finalText.trim(), Math.round(conf * 100) / 100); } catch (e) { console.error(e); } }
    };
    rec.onerror = function (ev) { errored = true; fail(ev && ev.error || 'error'); };
    rec.onend = function () { activeRec = null; if (!errored && opts.onEnd) { try { opts.onEnd(); } catch (e) { /* ignore */ } } };
    try { rec.start(); activeRec = rec; } catch (e) { fail('error'); return null; }
    return { stop: function () { try { rec.stop(); } catch (e) { /* ignore */ } } };
  }
  function stopListening() { if (activeRec) { try { activeRec.abort(); } catch (e) { /* ignore */ } activeRec = null; } }

  /** Scripted "as if transcribed" voice query (works with no mic). */
  function simulateVoice(text, opts) {
    opts = opts || {};
    var words = String(text).split(/(\s+)/);
    var acc = '', i = 0, ms = opts.wordMs || 140;
    return new Promise(function (resolve) {
      (function step() {
        if (i >= words.length) { try { opts.onResult && opts.onResult(text, 0.94); } catch (e) { console.error(e); } resolve(text); return; }
        acc += words[i++];
        try { opts.onInterim && opts.onInterim(acc); } catch (e) { console.error(e); }
        setTimeout(step, /\s/.test(words[i - 1]) ? 0 : ms);
      })();
    });
  }

  /* ---------------- TTS (text -> speech) ---------------- */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  function getVoices() {
    if (!synth) return Promise.resolve([]);
    var v = [];
    try { v = synth.getVoices() || []; } catch (e) { v = []; }
    if (v.length) return Promise.resolve(v);
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (done) return; done = true; var out = []; try { out = synth.getVoices() || []; } catch (e) { out = []; } resolve(out); }
      try { synth.addEventListener('voiceschanged', finish, { once: true }); } catch (e) { /* ignore */ }
      setTimeout(finish, 900);
    });
  }
  function pickVoice(voices, lang) {
    var info = langInfo(lang), want = (info.bcp47 || 'en-IN').toLowerCase(), pre = (lang || 'en').toLowerCase();
    var norm = function (v) { return String(v.lang || '').toLowerCase().replace('_', '-'); };
    return voices.filter(function (v) { return norm(v) === want; })[0] ||
      voices.filter(function (v) { return norm(v).split('-')[0] === pre; })[0] || null;
  }
  /** Read numbers the railway way: 12011 -> "1 2 0 1 1", PNR digit by digit. */
  function speechText(text) {
    return String(text || '').replace(/\b(\d{5}|\d{10})\b/g, function (m) { return m.split('').join(' '); })
      .replace(/⟦\d+⟧/g, '');
  }

  var sayEl = null;
  function sayCard(state, text, lang) {
    if (!sayEl) {
      sayEl = OT.h('<div class="say-card" role="status" aria-live="polite"></div>');
      document.body.appendChild(sayEl);
      sayEl.addEventListener('click', function (e) {
        if (e.target.closest('[data-say-stop]')) { stop(); }
        if (e.target.closest('[data-say-close]')) { stop(); hideSay(); }
      });
    }
    var n = langInfo(lang);
    var head = state === 'speaking'
      ? OT.icon('speaker', 16) + '<strong>' + OT.esc(T('voice.reading', 'Reading aloud')) + '</strong> · ' + OT.esc(n.native)
      : OT.icon('info', 16) + '<strong>' + OT.esc(T('voice.unavailTitle', 'Voice unavailable')) + '</strong> · ' + OT.esc(n.native);
    var msg = state === 'speaking' ? '' :
      '<p class="say-note">' + OT.esc(state === 'unsupported'
        ? T('voice.noTts', 'This browser cannot read text aloud. Here is the text instead.')
        : T('voice.noVoice', 'No {lang} voice is installed in this browser/device, so here is the text instead. Install a {lang} voice in your OS speech settings to hear it.', { lang: n.name })) + '</p>';
    sayEl.className = 'say-card show say-' + state;
    sayEl.innerHTML = '<div class="say-head">' + head + '<span class="say-sp"></span>' +
      (state === 'speaking' ? '<button class="btn btn-ghost btn-sm" data-say-stop>' + OT.icon('stop', 14) + OT.esc(T('voice.stop', 'Stop')) + '</button>' : '') +
      '<button class="icon-btn say-x" data-say-close aria-label="Close">' + OT.icon('x', 16) + '</button></div>' + msg +
      '<div class="say-text" lang="' + OT.esc(lang) + '">' + highlight(text) + '</div>';
  }
  function hideSay() { if (sayEl) sayEl.classList.remove('show'); }

  var speaking = false;
  function speak(text, lang, opts) {
    opts = opts || {};
    lang = lang || curLang();
    text = String(text || '');
    if (!synth || typeof window.SpeechSynthesisUtterance === 'undefined') {
      sayCard('unsupported', text, lang);
      return Promise.resolve({ ok: false, reason: 'unsupported' });
    }
    return getVoices().then(function (voices) {
      var v = pickVoice(voices, lang);
      if (!v) { sayCard('novoice', text, lang); OT.emit('tts', { ok: false, lang: lang }); return { ok: false, reason: 'no-voice' }; }
      return new Promise(function (resolve) {
        try { synth.cancel(); } catch (e) { /* ignore */ }
        var u = new window.SpeechSynthesisUtterance(speechText(text));
        u.voice = v; u.lang = v.lang; u.rate = opts.rate || 0.95;
        var settled = false;
        function end(ok) { if (settled) return; settled = true; speaking = false; hideSay(); OT.emit('tts', { ok: ok, lang: lang, end: true }); resolve({ ok: ok, voice: v.name }); }
        u.onend = function () { end(true); };
        u.onerror = function () { end(false); };
        sayCard('speaking', text, lang);
        speaking = true;
        try { synth.speak(u); } catch (e) { end(false); }
        OT.emit('tts', { ok: true, lang: lang, start: true });
      });
    }).catch(function () { sayCard('novoice', text, lang); return { ok: false, reason: 'error' }; });
  }
  function stop() { if (synth) { try { synth.cancel(); } catch (e) { /* ignore */ } } speaking = false; hideSay(); }

  /** Capability check used by UI/Settings: {asr, tts, voice(lang)} */
  function capabilities(lang) {
    lang = lang || curLang();
    return getVoices().then(function (voices) {
      return { asr: !!SR, tts: !!synth, voice: !!pickVoice(voices, lang), voices: voices.length, lang: lang };
    });
  }

  OT.lang = {
    label: 'BHASHINI-ready language layer (simulated)',
    supported: { asr: !!SR, tts: !!synth },
    detect: detect,
    normDigits: normDigits,
    protectTokens: protectTokens,
    restoreTokens: restoreTokens,
    tokensOf: tokensOf,
    highlight: highlight,
    keep: keep,
    transliterate: transliterate,
    translate: translate,
    translatedBlock: translatedBlock,
    listen: listen,
    stopListening: stopListening,
    simulateVoice: simulateVoice,
    speak: speak,
    stop: stop,
    isSpeaking: function () { return speaking; },
    capabilities: capabilities,
    samples: SAMPLES,
    info: langInfo,
    hideSay: hideSay
  };
})();
