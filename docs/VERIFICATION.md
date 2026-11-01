# IRCTC OneTrip: Verification report (v1)

Independent verification of the static prototype against the project brief, the requirements traceability (`docs/research/01_requirements.md`), the survey statistics (`docs/research/survey_stats.json`) and the build contract (`docs/ARCHITECTURE.md`). Verified on 1 Nov 2026 by a separate agent that did not build the app.

**Result:** after the fixes listed below, the automated suite passes **1354 of 1354 checks, with 0 failures**. It covers file:// and http, at 1440×900 and 375×812. We found 0 console errors and 0 page errors.

## 1. Test environment

| Item | Value |
|---|---|
| Browser | Chromium 153 (Playwright 1.63, headless), Python 3.13 |
| Entry points | `file:///…/index.html` (double-click) and `python3 -m http.server` (same as VS Code Live Server / `start-server.*`) |
| Viewports | Desktop 1440×900, mobile 375×812 |
| Network | Offline. Google Fonts and the Gemini endpoint are blocked on purpose: the fonts fall back to the system font, and Gemini falls back to the simulated agents. These two failures are the only ones the suite expects. |
| Voice | Headless Chromium has no TTS voices. Speech recognition is tested both as "present but failing" and as "absent", via an init script. |
| Test script | `tests/e2e.py`. Run it from the repo root with `python3 tests/e2e.py` (add `--quick` to test only en+hi on most matrices, or `--shots DIR` to save screenshots). The run writes `tests/last-run.json`, which git ignores. |

## 2. Test matrix and results

The matrix is {file, http} × {desktop, mobile}. The full language sweep runs on every combination except file-mobile, which runs en + hi.

| Suite | What it does (real clicks unless noted) | Checks | Fail |
|---|---|---|---|
| Assets | Every `src`/`href` in index.html and every CSS `url()` resolves to a file; no ES modules; no `fetch()` of local files | 2 | 0 |
| Traveller journey (×4) | The brief's 9 steps: select Hindi in the header → sample Hindi voice query (the brief's exact sentence) → live parse (CDG, ₹3,000) → *Find verified options* → Agent Trace (orchestrator + 5 specialists) → Hindi summary with ₹ amounts left untranslated → source, check time, badge and SIMULATED tag on **every** card → speaker → add hotel + cab → *View journey* → conflict flagged → fix (cloakroom) + link return → readiness rises → consolidated itinerary → *Review & pay* → double-click opens exactly one confirm dialog → nothing booked before confirming → confirm → `OT-XXX-XXXXX` refs → My Journey shows Confirmed → Bookings → cancel (confirm first) → refund tracker advances → assistant: Hindi refund question answered in Hindi with the booking ref → speaker → switch to Tamil mid-chat (history kept) → *Talk to a human* creates a `SUP-` ticket | 136 | 0 |
| Partner (×4) | Gate → register (validation, HTML escaped) → login → overview shows the live booking → listings: add, edit, pause, delete (with confirm), title escaped → calendar: day price/availability saved, next month, Fri–Sat +15% → enquiry: Partner Agent draft (has listing ₹) → send (confirm) → bookings (row "New via OneTrip"), performance, feedback, original/translation toggle | 82 | 0 |
| Admin (×4) | All 9 tabs render; the live booking ref appears; live GTV > 0 is included in totals; language analytics; financial products | 110 | 0 |
| Route sweep (×4) | home, results, journey, checkout, bookings, login, register, insights, about, settings and 404, in **all 11 languages** (en + hi on file-mobile): no NaN/undefined/`[object Object]`/`{placeholder}`/U+FFFD/mojibake text, no horizontal overflow at 375 px, zero console errors | 656 | 0 |
| Settings (×4) | Save key → *Test key* fails gracefully offline ("✗ … the app will keep using simulated agents") → with a broken key in hybrid mode, the agents and assistant still answer (fallback) → simulated mode → remove key (confirm) → voice check → reset (confirm) clears journey and bookings | 38 | 0 |
| Guided demo (×4) | Header *Start demo* (or the hero button on mobile). All 17 steps: Next is never stuck (25 s cap), every step has a highlighted target, the card stays inside the viewport and does not cover its target (desktop). The tour finishes on Business case with a confirmed booking. A second run presses Exit at step 5: the overlay is removed and the user restored. | 244 | 0 |
| Edge cases (×4) | Empty states (journey, checkout, bookings, partner, admin), *Load sample trip*, unknown route → not-found page, reload mid-flow (journey item kept, results re-render), reload on #/journey, **rapid language switching during an agent run** (ends in Hindi, single trace), header mic with failing SR, **no SpeechRecognition** (explains and offers a sample; the assistant mic also explains), **localStorage throwing** (whole flow works in memory) | 86 | 0 |
| **Total** | | **1354** | **0** |

Visual QA: each route was screenshotted at both widths, in en and hi, plus every tour step. The screenshots were reviewed by eye. The defects found are fixed below. Traveller and dashboard styling is consistent: both use navy/blue on white with saffron accents and the same cards, badges and buttons. No CSS class collision between `traveller.css` and `dashboards.css` was found. The traveller side uses `.ot-eyebrow`, `.board-*` and `.bkg/.bk-*`, while the dashboards use `.eyebrow`, `.board` and `.bk`. One collision inside `traveller.css` was found and fixed (#5 in section 4).

## 3. Traceability matrix

Status: **Pass** = present and tested; **Partial** = present with a stated limitation. No requirement is Fail.

### Brief: interfaces (§2)

| ID | Requirement | Where in the UI | Status | Evidence |
|---|---|---|---|---|
| T-1 | Home with journey search | `#/home`: `#trip-form` (from/to/date/travellers/budget/prefs) + "Ask in your language" box | Pass | journey suite |
| T-2 | Login and registration | `#/login`, `#/register` (role picker, consent toggles off by default) | Pass | route sweep, 11 langs |
| T-3 | My Journey dashboard | `#/journey`: ticket card, readiness ring, cost, timeline | Pass | journey suite |
| T-4 | Hotel, cab, food, sightseeing recommendations | `#/results`, 4 tabs | Pass | journey suite |
| T-5 | Consolidated itinerary | `#/journey` → *Consolidated itinerary* (modal table, Print) | Pass | ≥5 rows asserted |
| T-6 | Booking and payment summary | `#/checkout` (itemised, GST, IRCTC ticket shown as already paid) | Pass | journey suite |
| T-7 | Cancellation and refund tracking | `#/bookings`: cancel → 4-stage refund tracker | Pass | tracker advances |
| T-8 | Multilingual AI assistant | header chat icon → drawer | Pass | Hindi Q/A, switch to Tamil |
| T-9 | Voice search and voice support | header mic, home mic, assistant mic, sample voice chips | Pass (browser-dependent) | SR present/absent tests |
| P-1…P-7 | Partner register/login, listings, price & availability, enquiries, confirmed bookings, revenue/conversion/cancellations, feedback | `#/partner/{overview,listings,pricing,enquiries,bookings,performance,feedback}` | Pass (P-3 Partial) | partner suite. P-3: calendar/listing edits stay in the partner view; traveller results use the fixed sample catalogue (stated on screen) |
| A-1…A-6 | Users and providers, bookings and GTV, complaints/refunds/partner performance, destination demand, financial products, language usage/translation quality/support | `#/admin/{users,bookings,complaints,partners,demand,finance,language}` (+ overview, platform) | Pass | admin suite. Live booking included in totals |

### Brief: agents (§3), BHASHINI (§4), data rules (§7)

| ID | Requirement | Where | Status | Evidence |
|---|---|---|---|---|
| AG-1 | Orchestrator assigns tasks and combines results | Agent Trace: plan → Multilingual → intent → Research → Verification → reflection → Recommendation → Itinerary → Multilingual | Pass | ≥6 agents asserted |
| AG-2 | Research records source + check time | each card's `.source-line` ("Source: … checked 01 Nov 2026, 19:13 IST (9 min ago)") | Pass | asserted on every card |
| AG-3 | Verification re-checks independently; flags missing/stale/contradictory | Verification log per card; "Needs confirmation", stale "Re-check now", sold-out hidden list | Pass | `agents.js verifyOne()` compares against `providerSource` |
| AG-4 | Recommendation by destination/budget/date/prefs | "Why this?" chips; over-budget items listed as filtered | Pass | |
| AG-5 | Itinerary: chronological, conflicts | timeline + "Arrival 11:05 vs check-in 14:00" with 3 fixes | Pass | |
| AG-6 | Customer Support agent + human escalation | assistant drawer, *Talk to a human* → `SUP-` ticket | Pass | |
| AG-7 | Partner Agent | partner enquiries → *Draft reply with Partner Agent* | Pass | |
| AG-8 | Multilingual agent | detect + NMT (phrasebook/Gemini) + TTS + transliteration | Pass (simulated) | |
| DR-1 | AI never invents prices, availability, ratings or timings | Code review: all prices come from `OT.data.travel` (`livePrice = providerSource.price`). Gemini is used only for intent (validated against an allow-list) and phrasing. The support-agent and Partner-Agent Gemini replies are rejected if they contain a ₹ amount that is not in the data (the Partner-Agent guardrail was **added** during verification) | Pass | |
| DR-2 | Unverifiable data shown as unavailable / needs confirmation | "Rating unavailable at source", "Needs confirmation" badges, checkout blocks payment until a changed price is accepted or stale data is re-checked | Pass | |
| DR-3 | BHASHINI is not a source of truth | About → Data & verification rules | Pass | |
| ML-1 | Select preferred language (11) | header `#lang-select` | Pass | all 11 swept |
| ML-2 | Speak → text | mic (Web Speech) or sample voice (simulated ASR) | Pass | |
| ML-3 | Recommendations in that language | Hindi summary, labels, policies | Pass (en/hi full; 9 others partial UI coverage, explained on About) | |
| ML-4 | Speaker button | results summary, assistant messages, journey "Play itinerary aloud", confirmation | Pass (needs an OS voice; otherwise a text card explains) | |
| ML-5 | Continue in the same language / change at any point | assistant keeps history across switches; every route re-renders | Pass | |
| ML-6 | Transliteration | type "mujhe hotel chahiye" → suggestion in Devanagari (home and assistant) | Pass (hi/ta/bn word maps) | |
| ML-7 | Language detection | parse chip "हिन्दी · 9x%", user-message meta | Pass | |
| SG-1 | Do not modify train no., PNR, dates, prices, station codes, refs | `bdi.keep` tokens; Gemini NMT restores ⟦n⟧ placeholders or falls back | Pass | test: ₹ in Latin digits, no Devanagari digits in hi output; confirm dialog shows 4521837690 / 12011 / ₹ unchanged |
| SG-2 | Preserve the original next to the translation | "Show original" on summaries, assistant replies, cancellation policy | Pass | |
| SG-3 | Verify critical policy translations | policy text from reviewed templates, marked "(reviewed translation)" | Pass (simulated) | |
| SG-4 | Confirm important actions | confirm dialogs for pay, cancel, listing delete, partner reply, key removal, reset, new trip | Pass | "nothing booked before confirm" asserted |
| SG-5 | Uncertain translation → original or human | low confidence → "Low confidence: original shown; a human can help." and escalation chip | Pass | |
| SG-6 | Explain unavailable language/voice | "Voice input is not supported…", "No Hindi voice is installed…", partial-coverage note | Pass | no-SR test |

### Brief: UI/UX (§5), features (§6), prototype (§8), deliverables (§9)

| ID | Requirement | Where | Status |
|---|---|---|---|
| UX-1 | Blue/white, subtle orange, modern cards, icons | global | Pass |
| UX-2 | Clear booking-status indicators | badges Verified / Needs confirmation / Planned / Confirmed / Cancelled / Refunded | Pass |
| UX-3 | Timeline-based trip dashboard | `#/journey` railway route-line timeline | Pass |
| UX-4 | Mobile responsive | 375 px sweep: no horizontal overflow on any route, in 11 languages | Pass |
| UX-5 | Language selector in header; mic + speaker | header | Pass |
| UX-6 | 9-step main journey | journey suite walks all 9 | Pass |
| F-1…F-13 | Consolidated dashboard, Trip Readiness, hotel/transport recs, chronological timeline, price comparison, clear policies, status tracking, partner performance, admin analytics, AI assistance, multilingual text+voice, switching throughout, audio playback | as above | Pass |
| PR-1 | Sample train, simulated hotels/cabs | 12011 NDLS→CDG (+ MDU, PURI) | Pass |
| PR-2 | Demonstrate research and verification, itinerary, adding services, readiness, Hindi voice query, translate + read aloud | guided demo, 17 steps | Pass |
| PR-3 | Simulated payments; no real payment data; label simulated data; no live-integration claim | global banner "No live IRCTC, BHASHINI or bank integration", SIMULATED tags on every price, masked demo payment fields (disabled inputs) | Pass |
| D-1…D-7 | Traveller, partner, admin, agent workflow, labelled simulated BHASHINI, responsive, sample data, full journey demo | | Pass |

### Explorer-1 "Must" items not covered above

| ID | Where | Status |
|---|---|---|
| FR-01/02/03/05/06/08/10/11/14/15/16 | home, results cards (provider, IRCTC-managed vs partner, Sponsored label, policy and refund owner), "Not for me" dismiss + Undo (kept for the session) | Pass |
| ECO-01 | checkout "owners" box (Partner Bank payments, provider refunds, OneTrip support) | Pass |
| DAT-01 | Business case → Q2 data parameters table | Pass |
| DAT-02 | register consents (all off), partner role gate | Pass |
| BNK-01/02 | checkout payment owner; admin Bank & finance names the issuer/lender | Pass |
| TRUST-01 | every card: provider, price, availability, check time, policy; partner listing without a policy cannot go live | Pass |
| CORE-01 | admin overview "Social-mandate guardrails" (ticket success, p95 latency), "Continue to IRCTC ticketing" link | Pass (simulated KPIs) |
| BR-AG02, BR-ML01–08, BR-PR01 | see DR / ML / SG / PR rows | Pass |

### Business case and course

| Check | Result |
|---|---|
| Survey figures match `survey_stats.json` exactly | **Pass.** `js/data/survey.js` was compared key by key with the JSON (identical). Every hard-coded figure in `insights.js` text was checked (42.3/36.5, 23.1/21.2, 30.8, 44.2, 69.2, 7.7, 81.2, 41.2, 73.3, 68.6/29.4, 13.5, 15.4, 78.8 …). The illustrative model is labelled "ILLUSTRATIVE ASSUMPTIONS". |
| 5 case questions visibly addressed | **Pass.** Business case has Q1 Solution review, Q2 Data parameters, Q3 Marketing & advertising, Q4 Role of banks, Q5 Financial products for 3 segments |
| Course frameworks | **Pass.** Platform/flywheel, VRIO, Sense–Seize–Transform (insights + admin), hype cycle, agentic autonomy levels / human-in-the-loop (Agent Trace + About) |

## 4. Bugs found and fixed

| # | File | Fix |
|---|---|---|
| 1 | `js/views/shell.js` | **Mobile menu never opened** when the hamburger icon was tapped: the click handler re-rendered the SVG, so the outside-click handler saw a detached target and closed the menu at once. Fixed with stopPropagation plus an `isConnected` guard. |
| 2 | `js/core/ui.js` | Double-clicking *Pay* / *Cancel* opened the confirm dialog, and the 2nd click landed on the new backdrop and closed it. Backdrop clicks are now ignored for 500 ms after a dialog opens. |
| 3 | `js/core/ui.js` | Toasts piled up (4+) during the tour and covered the tour card on mobile. At most 2 toasts are now shown. |
| 4 | `css/base.css` | During the tour, toasts move to the top of the screen so they never cover the presenter card. |
| 5 | `css/traveller.css` | `.co-ticket span {display:block}` broke the "Paid on IRCTC" / "CNF" badges on checkout and bookings (icon on its own line). Badges are now scoped back to inline-flex. |
| 6 | `css/base.css` | The empty-journey "Load sample trip (New Delhi → Chandigarh)" button overflowed at 375 px. Empty-state buttons can now wrap. |
| 7 | `js/views/partner.js` | Gemini Partner-Agent drafts had no price guardrail. A draft with any ₹ amount not in the listings now falls back to the listing-grounded template. |
| 8 | `js/views/partner.js` | The copy claimed "Prices you set here are what travellers see". It now says this happens in production, and that the prototype's traveller results use the fixed sample catalogue. |
| 9 | `js/agents/agents.js` | The Hindi Partner-Agent draft inserted the English "your date" when no date was given. It now uses Hindi. |
| 10 | `js/views/auth.js` | `partnerId` on the signed-in card is now HTML-escaped. |

Security: `grep` of the repository and git history for `AIza…`, `AQ.Ab8`, `key=…`, `sk-…` and hard-coded `api_key` literals found **no secrets**. The Gemini key lives only in the browser's localStorage (Settings), and `.gitignore` excludes `config.js`, `*.local.js` and `.env`. All user-supplied and AI text reaches the DOM through `OT.esc`, `OT.lang.highlight` (which escapes) or `textContent`. This was confirmed by an XSS probe in partner registration and listing titles. Confirm-dialog `lines` are HTML by contract, and every caller escapes its variables.

## 5. Remaining known limitations

1. **Voice depends on the device.** Speech recognition needs Chrome or Edge, and read-aloud needs an installed voice for the selected language (Hindi is often missing on Windows). Without them the app shows the text and a clear message, and the sample voice chips always work.
2. **Language coverage.** English and Hindi are complete. The other 9 languages cover the header, search, timeline, statuses and assistant chrome, and the rest falls back to English, as the About page explains. Several assistant answers in those languages fall back to English, with a visible note.
3. **Partner edits are not reflected in traveller results** (sample catalogue). This is stated on the partner pages.
4. **The tour captions are in English** (presenter notes), while the UI switches to Hindi as part of the story.
5. **On a 375 px phone, the tour card covers the lower part of the screen,** including the confirm dialog's buttons at step 12. The tour presses them for you, so this does not block the demo, but a laptop is the better demo device.
6. Data checked-at times are relative to page load ("9 min ago"), because the data is simulated. The stale-data flag is deterministic by design.
7. Gemini (optional) has been tested only offline (graceful failure). A live key was not available to the verifier.

## Jury demo checklist

1. Use **Chrome or Edge** on a laptop (window ≥ 1280 px wide). Open `index.html` by double-click, or run `start-server.bat` / `start-server.sh`.
2. Before the jury arrives, open **Settings → Reset demo data**, then pick the starting language (English).
3. Set **AI mode to "Simulated only"** unless the venue Wi-Fi and the Gemini key have been tested that morning (Settings → *Test key*).
4. Windows: install the Hindi voice under **Settings → Time & Language → Speech → Add voices → Hindi**, then reopen the browser. macOS: System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Hindi.
5. Check **Settings → Voice capability check**: Hindi should show "voice(s)", and speech recognition should show "supported". Press *Play a Hindi sample* and confirm the audio comes out of the room's speakers.
6. **Allow the microphone** on the first prompt. From file://, Chrome may ask again on every load; a local server (Live Server / start-server) remembers the choice.
7. Have a fallback ready: the **हिन्दी sample voice chip** does the full Hindi query without a mic.
8. For the scripted run, press **Start demo** (header) and then only *Next*. *Back* works, and **×** or Esc exits at any point.
9. For the "wow" moment, after paying, open **Partner** (Hotel Shivalik View, P-101) to show the new booking highlighted, then **Admin & Bank → Language & support**.
10. Close other tabs and turn off notifications and screen savers. Zoom the browser to 100% (Ctrl+0). Keep the README and this checklist open on a second screen.
