/* IRCTC OneTrip — Settings (#/settings) — Builder B.
 * Gemini API key (kept only in this browser's localStorage), model, AI mode, key test,
 * voice capability check, reset demo data.
 */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;
  var K = OT.dashkit;
  var t = K.t;
  var voiceHandler = null;

  if (OT.i18n && OT.i18n.extend) {
    OT.i18n.extend({ hi: {
      'settings.title': 'सेटिंग्स',
      'settings.h': 'सेटिंग्स और AI कुंजी',
      'settings.ai': 'AI सेटअप (वैकल्पिक)',
      'settings.key': 'Gemini API कुंजी',
      'settings.save': 'सहेजें',
      'settings.test': 'कुंजी जाँचें',
      'settings.remove': 'कुंजी हटाएँ',
      'settings.mode': 'AI मोड',
      'settings.voice': 'आवाज़ की सुविधा जाँच',
      'settings.reset': 'डेमो डेटा रीसेट करें'
    } });
  }

  var FALLBACK_LANGS = [
    { code: 'en', name: 'English', bcp47: 'en-IN' }, { code: 'hi', name: 'Hindi', bcp47: 'hi-IN' }, { code: 'bn', name: 'Bengali', bcp47: 'bn-IN' },
    { code: 'mr', name: 'Marathi', bcp47: 'mr-IN' }, { code: 'ta', name: 'Tamil', bcp47: 'ta-IN' }, { code: 'te', name: 'Telugu', bcp47: 'te-IN' },
    { code: 'kn', name: 'Kannada', bcp47: 'kn-IN' }, { code: 'ml', name: 'Malayalam', bcp47: 'ml-IN' }, { code: 'gu', name: 'Gujarati', bcp47: 'gu-IN' },
    { code: 'pa', name: 'Punjabi', bcp47: 'pa-IN' }, { code: 'or', name: 'Odia', bcp47: 'or-IN' }
  ];

  function langs() { return (OT.i18n && OT.i18n.languages && OT.i18n.languages.length) ? OT.i18n.languages : FALLBACK_LANGS; }
  function gm() { return OT.gemini || { DEFAULT_MODEL: 'gemini-2.5-flash', available: function () { return false; } }; }

  function voiceRows() {
    var synth = window.speechSynthesis;
    var voices = [];
    try { voices = synth ? synth.getVoices() : []; } catch (e) { voices = []; }
    return langs().map(function (l) {
      var tag = (l.bcp47 || l.code).toLowerCase(), base = tag.split('-')[0];
      var match = voices.filter(function (v) { var vl = String(v.lang || '').toLowerCase().replace('_', '-'); return vl === tag || vl.split('-')[0] === base; });
      var tts = match.length ? '<span class="badge b-ok">' + OT.icon('checkCircle', 13) + esc(match.length + ' ' + t('settings.voices', 'voice(s)')) + '</span><span class="sub">' + esc(match.slice(0, 2).map(function (v) { return v.name; }).join(', ')) + '</span>'
        : '<span class="badge b-warn">' + OT.icon('alert', 13) + esc(t('settings.noVoice', 'No voice on this device')) + '</span><span class="sub">' + esc(t('settings.textFallback', 'Text shown instead of read-aloud')) + '</span>';
      return '<tr><td>' + esc(l.name) + (l.native && l.native !== l.name ? ' <span class="muted">· ' + esc(l.native) + '</span>' : '') + '</td><td><span class="lang-chip">' + esc(l.bcp47 || l.code) + '</span></td><td>' + tts + '</td></tr>';
    }).join('');
  }

  function render(el) {
    var root = document.createElement('div');
    el.appendChild(root);
    var key = OT.store.get('geminiKey') || '';
    var model = OT.store.get('geminiModel') || gm().DEFAULT_MODEL;
    var mode = OT.store.get('aiMode', 'hybrid');
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var hasSynth = 'speechSynthesis' in window;
    var status = key && mode !== 'simulated' ? '<span class="badge b-ok">' + OT.icon('spark', 13) + esc(t('settings.st.live', 'Live AI with fallback')) + '</span>' :
      key ? '<span class="badge b-info">' + OT.icon('bot', 13) + esc(t('settings.st.simKey', 'Key saved · Simulated mode')) + '</span>' : '<span class="badge b-sim">' + OT.icon('bot', 13) + esc(t('settings.st.sim', 'Simulated agents (no key)')) + '</span>';
    root.innerHTML = '<div class="container page">' +
      '<div class="page-head"><div><div class="eyebrow">' + esc(t('settings.title', 'Settings')) + '</div><h1>' + esc(t('settings.h', 'Settings & AI key')) + '</h1><p>' + esc(t('settings.sub', 'Everything works without a key: the agents run on transparent rules. Add a Gemini key to let live AI understand free-form queries.')) + '</p></div><div>' + status + '</div></div>' +
      '<div class="set-grid"><div class="stack">' +
        '<div class="card"><h3>' + esc(t('settings.ai', 'AI setup (optional)')) + '</h3>' +
          '<div class="privacy-note" style="margin:10px 0 16px">' + OT.icon('lock', 18) + '<span>' + esc(t('settings.privacy', 'Your key is stored only in this browser’s localStorage. It is never written into the code and never sent anywhere except directly to Google’s Gemini API when an AI call is made. “Remove key” deletes it.')) + '</span></div>' +
          '<form data-key-form novalidate class="stack">' +
            '<div class="field"><label for="st-key">' + esc(t('settings.key', 'Gemini API key')) + '</label><div class="key-row"><input class="input" id="st-key" type="password" autocomplete="off" spellcheck="false" placeholder="AIza…" value="' + esc(key) + '"><button class="btn btn-ghost" type="button" data-act="toggle" aria-pressed="false" aria-controls="st-key">' + OT.icon('eye', 16) + '<span>' + esc(t('settings.show', 'Show')) + '</span></button></div>' +
              '<span class="small muted">' + esc(t('settings.keyHint', 'Get a free key at Google AI Studio (aistudio.google.com). Use a restricted key for demos.')) + '</span></div>' +
            '<div class="field"><label for="st-model">' + esc(t('settings.model', 'Model')) + '</label><input class="input" id="st-model" list="st-models" value="' + esc(model) + '" spellcheck="false"><datalist id="st-models"><option value="gemini-2.5-flash"><option value="gemini-2.5-flash-lite"><option value="gemini-2.0-flash"></datalist><span class="small muted">' + esc(t('settings.modelHint', 'Default: {m}. Fast “flash” models suit live demos.', { m: gm().DEFAULT_MODEL })) + '</span></div>' +
            '<fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:6px">' + esc(t('settings.mode', 'AI mode')) + '</legend><div class="seg-ctl">' +
              '<label><input type="radio" name="st-mode" value="hybrid"' + (mode !== 'simulated' ? ' checked' : '') + '><div><strong>' + esc(t('settings.hybrid', 'Hybrid')) + '</strong><span>' + esc(t('settings.hybridSub', 'Live AI when a key works; falls back to simulated agents instantly on any error or timeout.')) + '</span></div></label>' +
              '<label><input type="radio" name="st-mode" value="simulated"' + (mode === 'simulated' ? ' checked' : '') + '><div><strong>' + esc(t('settings.simOnly', 'Simulated only')) + '</strong><span>' + esc(t('settings.simOnlySub', 'Deterministic rules, no network calls. Safest for a jury demo on weak Wi-Fi.')) + '</span></div></label></div></fieldset>' +
            '<div class="row-wrap"><button class="btn btn-primary" type="submit">' + esc(t('settings.save', 'Save')) + '</button><button class="btn btn-ghost" type="button" data-act="test">' + OT.icon('spark', 16) + esc(t('settings.test', 'Test key')) + '</button><button class="btn btn-ghost" type="button" data-act="remove"' + (key ? '' : ' disabled') + '>' + OT.icon('trash', 16) + esc(t('settings.remove', 'Remove key')) + '</button></div>' +
            '<div class="test-out" data-test-out role="status" aria-live="polite"></div>' +
          '</form>' +
          '<p class="small muted" style="margin:14px 0 0">' + esc(t('settings.guard', 'Even in live mode, Gemini only interprets language and phrases replies. Prices, availability and timings always come from the (simulated) provider data and pass the Verification Agent.')) + '</p></div>' +
        '<div class="card"><h3>' + esc(t('settings.reset', 'Reset demo data')) + '</h3><p class="small muted">' + esc(t('settings.resetSub', 'Clears the journey, bookings, cancellations, tickets, partner listings and enquiries, and signs you out. Your language, AI key and model are kept.')) + '</p><button class="btn btn-danger" data-act="reset">' + OT.icon('refresh', 16) + esc(t('settings.resetBtn', 'Reset demo data')) + '</button></div>' +
      '</div>' +
      '<div class="stack"><div class="card"><h3>' + esc(t('settings.voice', 'Voice capability check')) + '</h3><p class="small muted">' + esc(t('settings.voiceSub', 'Voice depends on your browser and device. BHASHINI would provide server-side ASR/TTS for all 11 languages; this prototype uses the browser’s Web Speech API.')) + '</p>' +
        '<div class="stack" style="margin-bottom:12px">' +
          '<div>' + (SR ? '<span class="badge b-ok">' + OT.icon('mic', 13) + esc(t('settings.srYes', 'Speech recognition supported')) + '</span>' : '<span class="badge b-warn">' + OT.icon('mic', 13) + esc(t('settings.srNo', 'Speech recognition not supported — type instead, or use Chrome / Edge')) + '</span>') + '</div>' +
          '<div>' + (hasSynth ? '<span class="badge b-ok">' + OT.icon('speaker', 13) + esc(t('settings.ttsYes', 'Read-aloud (speech synthesis) supported')) + '</span>' : '<span class="badge b-warn">' + OT.icon('speaker', 13) + esc(t('settings.ttsNo', 'Read-aloud not supported in this browser')) + '</span>') + '</div>' +
          (location.protocol === 'file:' && SR ? '<p class="small muted" style="margin:0">' + OT.icon('info', 14) + ' ' + esc(t('settings.fileNote', 'Opened from a file: some browsers ask for microphone permission each time. A local server (e.g. VS Code Live Server) remembers it.')) + '</p>' : '') +
        '</div>' +
        '<div class="table-wrap"><table class="table voice-table"><thead><tr><th>' + esc(t('settings.lang', 'Language')) + '</th><th>' + esc(t('settings.code', 'Code')) + '</th><th>' + esc(t('settings.tts', 'Read-aloud voices on this device')) + '</th></tr></thead><tbody data-voice-rows>' + voiceRows() + '</tbody></table></div>' +
        '<div class="row-wrap" style="margin-top:10px"><button class="btn btn-ghost btn-sm" data-act="speak"' + (hasSynth ? '' : ' disabled') + '>' + OT.icon('speaker', 15) + esc(t('settings.sample', 'Play a Hindi sample')) + '</button><button class="btn btn-ghost btn-sm" data-act="recheck">' + OT.icon('refresh', 15) + esc(t('settings.recheck', 'Re-check voices')) + '</button></div></div></div>' +
      '</div></div>';

    var out = root.querySelector('[data-test-out]');
    function save(silent) {
      var k = OT.$('#st-key', root).value.trim();
      var m = OT.$('#st-model', root).value.trim() || gm().DEFAULT_MODEL;
      var md = (root.querySelector('input[name="st-mode"]:checked') || {}).value || 'hybrid';
      if (k) OT.store.set('geminiKey', k); else OT.store.set('geminiKey', undefined);
      OT.store.set('geminiModel', m);
      OT.store.set('aiMode', md);
      if (!silent) OT.toast(t('settings.saved', 'Settings saved in this browser'), 'success');
    }
    root.addEventListener('submit', function (e) { e.preventDefault(); save(); OT.router.render(); });
    root.addEventListener('change', function (e) {
      if (e.target.name === 'st-mode') { OT.store.set('aiMode', e.target.value); OT.toast(e.target.value === 'simulated' ? t('settings.toSim', 'Simulated-only mode on') : t('settings.toHybrid', 'Hybrid mode on'), 'info'); }
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'toggle') {
        var inp = OT.$('#st-key', root), show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        b.setAttribute('aria-pressed', String(show));
        b.querySelector('span').textContent = show ? t('settings.hide', 'Hide') : t('settings.show', 'Show');
      }
      if (act === 'test') {
        var k = OT.$('#st-key', root).value.trim();
        if (!k) { out.className = 'test-out bad'; out.textContent = t('settings.needKey', 'Enter a key first.'); return; }
        save(true);
        if (!OT.gemini || typeof OT.gemini.test !== 'function') { out.className = 'test-out bad'; out.textContent = t('settings.noSvc', 'Gemini service not loaded.'); return; }
        out.className = 'test-out run'; out.textContent = t('settings.testing', 'Testing connection to Gemini…');
        b.disabled = true;
        Promise.resolve(OT.gemini.test()).then(function (r) {
          r = r || {};
          out.className = 'test-out ' + (r.ok ? 'ok' : 'bad');
          out.textContent = (r.ok ? '✓ ' : '✗ ') + (r.message || '') + (r.ok ? '' : ' — ' + t('settings.fallbackNote', 'the app will keep using simulated agents.'));
        }).catch(function (err) {
          out.className = 'test-out bad'; out.textContent = '✗ ' + (err && err.message ? err.message : 'Test failed');
        }).then(function () { b.disabled = false; });
      }
      if (act === 'remove') {
        OT.confirmAction({ title: t('settings.removeQ', 'Remove the Gemini key?'), lines: [esc(t('settings.removeL', 'The key is deleted from this browser. The app continues with simulated agents.'))], confirmLabel: t('settings.remove', 'Remove key'), danger: true }).then(function (ok) {
          if (!ok) return;
          OT.store.set('geminiKey', undefined);
          OT.toast(t('settings.removed', 'Key removed from this browser'), 'success');
          OT.router.render();
        });
      }
      if (act === 'reset') {
        OT.confirmAction({ title: t('settings.resetQ', 'Reset all demo data?'), lines: [esc(t('settings.resetL1', 'Journey, bookings, refunds, support tickets, partner listings and enquiries are cleared.')), esc(t('settings.resetL2', 'You will be signed out. Language and AI key are kept.'))], confirmLabel: t('settings.resetBtn', 'Reset demo data'), danger: true }).then(function (ok) {
          if (!ok) return;
          OT.store.reset();
          OT.toast(t('settings.resetDone', 'Demo data reset'), 'success');
          OT.router.render();
        });
      }
      if (act === 'speak') {
        try {
          var u = new SpeechSynthesisUtterance('नमस्ते! चंडीगढ़ में आपका होटल पक्का हो गया है।');
          u.lang = 'hi-IN';
          var v = window.speechSynthesis.getVoices().filter(function (x) { return /^hi/i.test(x.lang); })[0];
          if (v) u.voice = v; else OT.toast(t('settings.noHiVoice', 'No Hindi voice on this device — your browser may use a default voice.'), 'info');
          window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
        } catch (err) { OT.toast(t('settings.speakFail', 'Read-aloud is not available here.'), 'error'); }
      }
      if (act === 'recheck') { var tb = root.querySelector('[data-voice-rows]'); if (tb) tb.innerHTML = voiceRows(); OT.toast(t('settings.rechecked', 'Voices re-checked'), 'info'); }
    });

    if (hasSynth) {
      voiceHandler = function () { var tb = root.querySelector('[data-voice-rows]'); if (tb && document.body.contains(tb)) tb.innerHTML = voiceRows(); };
      try { window.speechSynthesis.addEventListener('voiceschanged', voiceHandler); } catch (e) { voiceHandler = null; }
    }
  }

  OT.registerView('settings', {
    title: function () { return t('settings.title', 'Settings'); },
    section: 'settings',
    render: render,
    onLeave: function () {
      if (voiceHandler && window.speechSynthesis) { try { window.speechSynthesis.removeEventListener('voiceschanged', voiceHandler); } catch (e) { /* noop */ } }
      voiceHandler = null;
    }
  });
})();
