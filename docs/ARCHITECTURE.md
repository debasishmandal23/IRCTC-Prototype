# IRCTC OneTrip — Architecture & build contract

Static site: `index.html` + `css/` + `js/`. **No build step, no ES modules, no fetch() of local files**:
everything must work when `index.html` is opened by double-click (`file://`) AND via any static server
(VS Code Live Server, `npx serve`, `python -m http.server`). Data lives in JS files that assign to `OT.data.*`.
No external JS libraries/CDNs (offline-safe). Only external request: Google Fonts CSS (has system fallbacks)
and the optional Gemini API call.

## Global namespace `window.OT` (already implemented — do not rewrite, extend only)
| File | Provides |
|---|---|
| `js/core/util.js` | `OT.esc, OT.inr, OT.compact, OT.$, OT.$$, OT.h(html)->Element, OT.sleep, OT.uid, OT.stamp(date)`, event bus `OT.on/off/emit` |
| `js/core/store.js` | `OT.store.get(k, fallback) / set(k,v) / update(k,fn) / reset()` — persisted keys: lang,user,journey,bookings,geminiKey,geminiModel,aiMode,cancellations,partnerListings,enquiries,tickets. Emits `store:<key>` |
| `js/core/ui.js` | `OT.icon(name,size)`, `OT.badge(status,label?)`, `OT.simTag(text?)`, `OT.toast(msg,kind)`, `OT.modal({...})`, `OT.confirmAction({title,lines,confirmLabel,danger}) -> Promise<bool>` |
| `js/core/router.js` | `OT.registerView(name,{title,section,render(el,{sub,query}),onLeave})`, `OT.go('path')`. Hash routes `#/name/sub?x=y` |
| `js/services/gemini.js` | `OT.gemini.available()`, `generate(prompt,{system,json,timeoutMs})`, `test()` — always wrap in try/catch and fall back |
| `css/base.css` | tokens + `.container .page .page-head .card .card-flat .panel-wash .grid(-2/3/4) .row .btn(-primary/accent/ghost/danger/sm/lg/block/link) .icon-btn .input .field .chip .badge .kpi .table .tabs/.tab .bar .sim-tag .source-line` |

Icon names: see `OT.iconNames` (train, hotel, cab, food, sight, mic, speaker, globe, search, checkCircle, alert, clock, calendar, user, users, wallet, card, shield, bot, spark, route, map, pin, star, chart, pie, refund, settings, send, play, chat, plus, minus, edit, trash, arrowRight, arrowLeft, chevronDown, menu, info, bank, rupee, headset, flag, layers, download, eye, lock, logout, store, target, trending, filter, refresh, leaf, temple, x, xCircle, check, stop).

## i18n contract (`js/core/i18n.js`, Builder A)
- `OT.t(key, fallbackEnglish, vars?)` — returns string in current language, falls back to `fallbackEnglish`. `{name}` placeholders replaced from vars.
- `OT.i18n.lang()`, `OT.i18n.setLang(code)` (persists, emits `'lang'`, shell re-renders current view), `OT.i18n.languages` = `[{code:'en',name:'English',native:'English',bcp47:'en-IN',script:'Latn'}, …]` for en, hi, bn, mr, ta, te, kn, ml, gu, pa, or.
- `OT.i18n.extend({hi:{key:'…'}, ta:{…}})` — any file may add strings.
- Static HTML uses `data-i18n="key"`; shell re-applies on language change.
- Full UI translation is required for **en + hi**; for other languages translate at least header/nav, home hero/search, journey timeline labels, readiness, status badges (`status.verified` etc.), assistant UI. Untranslated strings fall back to English silently — that is acceptable and should be explained on the About page.

## Shared state shapes (both builders must follow)
```js
OT.store 'user'      = { name, email, phone, role:'traveller'|'partner'|'admin' } | undefined
OT.store 'journey'   = {
  id, pnr:'4521837690', simulated:true,
  train:{ no:'12011', name:'Kalka Shatabdi Express', from:'NDLS', fromName:'New Delhi', to:'CDG', toName:'Chandigarh',
          date:'2026-11-14', dep:'07:40', arr:'11:05', cls:'CC', coach:'C3', seats:['41','42'], status:'CNF' },
  passengers:2, budget:3000, prefs:{veg:true, ...},
  items:[ { id, type:'hotel'|'cab'|'food'|'sight', refId /* id in OT.data.travel.* */, partnerId, title, price,
            when:'2026-11-14T11:20', endWhen?, status:'selected'|'confirmed'|'cancelled', bookingRef?, verification:'verified'|'confirm'|'unavailable' } ]
}
OT.store 'bookings'  = [ { ref:'OT-HTL-7F3K2', journeyId, itemId, type, partnerId, title, amount, status:'confirmed'|'cancelled'|'refunded',
                           paidAt:ISO, method:'UPI (simulated)', city, cancellation?:{ requestedAt, refundAmount, status:'processing'|'refunded', eta } } ]
```
**Cross-dashboard link (wow moment):** Hotels/cabs in `OT.data.travel` carry `partnerId`. Partner `P-101` = "Hotel Shivalik View, Chandigarh"
is the demo partner. When the traveller confirms a booking, Builder B's partner dashboard (logged in as P-101) must show it in
"Bookings" and in KPIs (merge `OT.store.get('bookings')` with static sample data), and Admin totals must include it. Listen to `store:bookings`.

## Ownership
**Builder A (traveller + AI + language)**: `js/core/i18n.js, js/data/travel.js, js/services/language.js, js/agents/agents.js,
js/agents/orchestrator.js, js/views/shell.js, home.js, results.js, journey.js, checkout.js, bookings.js, assistant.js, auth.js,
js/tour.js, js/app.js, css/traveller.css, assets/favicon.svg`.

**Builder B (dashboards + business case)**: `js/data/analytics.js, js/data/survey.js, js/lib/charts.js, js/views/partner.js,
js/views/admin.js, js/views/insights.js, js/views/about.js, js/views/settings.js, css/dashboards.css`.

Never edit the other builder's files. If you need something from the other side, code defensively (`if (OT.lang) …`).

## Routes
| Route | View | Owner |
|---|---|---|
| `#/home` | hero + journey search (text/voice), sample Hindi query buttons | A |
| `#/results?...` | agent run (live Agent Trace) → verified recommendations: hotels, cabs, food, sightseeing; price comparison; add to journey | A |
| `#/journey` | My Journey: Trip Readiness ring, chronological route-line timeline, conflict flags, manage items | A |
| `#/checkout` | booking + payment summary, simulated UPI/card, human-in-the-loop confirm, confirmation | A |
| `#/bookings` | booking status, cancellation & refund tracking, support ticket | A |
| `#/login`, `#/register` | traveller / partner / admin login (simulated), role picker | A |
| assistant drawer | multilingual chat + mic + speaker, Customer Support agent, human escalation | A |
| `#/partner[/sub]` | partner login gate, overview KPIs, listings CRUD, prices & availability, enquiries (+Partner Agent reply drafts), bookings, revenue/conversion/cancellations, feedback | B |
| `#/admin[/sub]` | users & providers, bookings & GTV, complaints & refunds, partner performance, destination demand, financial products (bank), language analytics & support | B |
| `#/insights` | business case: problem, survey evidence (charts from real survey stats), personas, 5 case questions, data parameters, bank role, financial products, revenue model, social-mandate guardrails, flywheel | B |
| `#/about` | how it works: agent architecture diagram, BHASHINI pipeline, data & verification rules, what is simulated, tech notes | B |
| `#/settings` | Gemini key (stored only in this browser), model, AI mode (hybrid/simulated), test key, voice support check, reset demo data | B |

## Agents (Builder A) — `OT.agents`
`OT.agents.run(query, {onStep})` → Orchestrator dispatches: Multilingual (detect/translate, protect tokens) → Research (catalogue lookup,
records source+checkedAt) → Verification (independent re-check vs. "provider source", flags stale/missing/contradictory) → Recommendation
(rank by budget/prefs/distance) → Itinerary (chronological plan, conflicts e.g. 11:05 arrival vs 14:00 check-in) → Multilingual (translate back).
Each step emits `{agent, status:'running'|'done'|'warn', detail, ms}` for the visible Agent Trace. Customer Support + Partner agents used by
assistant and partner enquiries respectively (Partner agent: B may call `OT.agents.partnerDraftReply(enquiry)` if defined, else own template).

## Quality bar
- Zero console errors on every route, at 375px and 1440px widths.
- Every price/rating/availability shows source + checked time + verification badge. Everything simulated is labelled.
- Never translate PNR, train no., station codes, dates, prices, booking refs (wrap in `<bdi class="keep">`).
- Confirm dialog before book / pay / cancel.
