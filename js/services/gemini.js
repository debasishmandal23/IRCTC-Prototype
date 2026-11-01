/* IRCTC OneTrip — optional Gemini LLM service (browser-direct).
 *
 * The API key is NEVER stored in source code. The user pastes it in Settings;
 * it is kept only in this browser's localStorage (OT.store 'geminiKey').
 * Without a key — or if the call fails / times out — callers must fall back to
 * the deterministic simulated agents. Gemini is used for language understanding
 * and phrasing ONLY; prices, availability and timings always come from the
 * (simulated) provider catalogue and are verified by the Verification Agent.
 *
 * API:
 *   OT.gemini.available()                       -> boolean (key present and AI mode not 'simulated')
 *   OT.gemini.generate(prompt, {system, json, temperature, timeoutMs}) -> Promise<string|object>
 *   OT.gemini.test()                            -> Promise<{ok, message}>
 */
(function () {
  'use strict';
  var OT = window.OT;
  var ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';
  var DEFAULT_MODEL = 'gemini-2.5-flash';
  var lastError = null;

  function key() { return (OT.store.get('geminiKey') || '').trim(); }
  function model() { return (OT.store.get('geminiModel') || DEFAULT_MODEL).trim(); }

  function available() {
    return !!key() && OT.store.get('aiMode', 'hybrid') !== 'simulated';
  }

  function generate(prompt, opts) {
    opts = opts || {};
    if (!key()) return Promise.reject(new Error('No Gemini API key configured'));
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutMs = opts.timeoutMs || 15000;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, timeoutMs);

    var body = {
      contents: [{ role: 'user', parts: [{ text: String(prompt) }] }],
      generationConfig: { temperature: opts.temperature == null ? 0.3 : opts.temperature, maxOutputTokens: opts.maxTokens || 1024 }
    };
    if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
    if (opts.json) body.generationConfig.responseMimeType = 'application/json';
    // Faster responses on 2.5 models: disable extended thinking where supported.
    if (/2\.5-flash/.test(model())) body.generationConfig.thinkingConfig = { thinkingBudget: 0 };

    return fetch(ENDPOINT + encodeURIComponent(model()) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key() },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error && data.error.message) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
        var text = parts.map(function (p) { return p.text || ''; }).join('').trim();
        if (!text) throw new Error('Empty response from Gemini');
        if (opts.json) {
          var cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
          return JSON.parse(cleaned);
        }
        return text;
      });
    }).then(function (out) {
      clearTimeout(timer); lastError = null; OT.emit('gemini:status', { ok: true });
      return out;
    }, function (err) {
      clearTimeout(timer);
      lastError = err && err.name === 'AbortError' ? new Error('Gemini request timed out') : err;
      console.warn('[OT] Gemini call failed — falling back to simulated agents:', lastError.message);
      OT.emit('gemini:status', { ok: false, error: lastError.message });
      throw lastError;
    });
  }

  function test() {
    return generate('Reply with exactly: OK', { timeoutMs: 12000, maxTokens: 10 })
      .then(function (t) { return { ok: true, message: 'Connected to ' + model() + ' — reply: ' + String(t).slice(0, 40) }; })
      .catch(function (e) { return { ok: false, message: e.message }; });
  }

  OT.gemini = {
    available: available,
    generate: generate,
    test: test,
    model: model,
    DEFAULT_MODEL: DEFAULT_MODEL,
    lastError: function () { return lastError; }
  };
})();
