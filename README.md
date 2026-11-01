# IRCTC OneTrip — AI-powered, multilingual integrated travel platform (prototype v1)

> **One journey. One dashboard. In your language.**
> A working prototype for **Case 13 — "How should IRCTC expand its digital travel platform?"**
> (Business in the Digital Age, SPJIMR PGDM 2026–28).

OneTrip sits **after** the IRCTC ticket is booked. It plans the rest of the trip around the train:
hotel, cab, food and sightseeing. AI agents research and *independently verify* every option. The
traveller can speak or type in 11 Indian languages, and every arrangement is managed from one
**My Journey** dashboard with a **Trip Readiness** score.

> ⚠️ **Academic prototype.** All trains, hotels, cabs, prices, payments and analytics are **simulated** and labelled as such.
> There is **no live IRCTC, BHASHINI or bank integration**, and no real payment data is collected. The "BHASHINI layer" is a
> BHASHINI-ready simulation built on the browser's speech APIs, plus optional Gemini.

---

## ▶️ How to run

### Option 1 — Double-click (no installs)
1. Download or clone this repo.
2. Double-click **`index.html`**. It opens in your browser and everything works offline.
   *Use Chrome or Edge for voice input.*

### Option 2 — VS Code
1. `git clone https://github.com/debasishmandal23/IRCTC-Prototype.git` and open the folder in VS Code.
2. Install the recommended extension **Live Server** (VS Code will prompt you; see `.vscode/extensions.json`).
3. Right-click `index.html` → **Open with Live Server** (opens at `http://127.0.0.1:5500`).

### Option 3 — Any static server
```bash
./start-server.sh          # macOS / Linux  → http://localhost:8080
start-server.bat           # Windows (double-click)
# or: python -m http.server 8080   /   npx serve .
```
A local server (Option 2/3) is the most reliable way to get **microphone** permission in Chrome.

There is no build step and no dependencies: plain HTML, CSS and JavaScript (classic scripts, no frameworks, no CDNs).

---

## 🎬 3-minute jury demo

Click **Start demo** in the header. The guided tour drives the app by itself, so you only press **Next**:

1. Switch the site to **Hindi** → play the sample voice query
   *"मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए।"*
2. Watch the **Agent Trace**: Orchestrator → Multilingual → Research → **Verification** → Recommendation → Itinerary.
   Verification catches a changed price, stale data, a missing rating and a sold-out hotel.
3. Add the verified hotel (*Hotel Shivalik View*, partner P-101) and a cab → the **railway route-line timeline** builds itself and
   flags the conflict between the **11:05 arrival** and the **14:00 check-in**. Resolve it → Trip Readiness rises.
4. Checkout → **human-in-the-loop confirmation**. PNR, train number, prices and dates stay untranslated → simulated payment → booking refs.
5. Ask the assistant a refund question in Hindi → **🔊 listen** to the answer → switch language mid-chat → escalate to a human.
6. **Partner dashboard** → the booking you just made appears as *"New via OneTrip"*.
7. **Admin & Bank dashboard** → GTV includes it; language analytics; financial products; platform flywheel.
8. **Business case** → survey evidence (N = 52), the 5 case questions, revenue model calculator, course frameworks.

Pre-demo checklist: see [`docs/VERIFICATION.md`](docs/VERIFICATION.md#jury-demo-checklist).

---

## 🧭 What's inside

| Interface | Route | Highlights |
|---|---|---|
| **Traveller** | `#/home` | Journey search (type or speak), PNR import (simulated), sample voice queries in Hindi, Tamil and Bengali, station name-board hero |
| | `#/results` | Live Agent Trace, verified hotels, cabs, food and sightseeing, source + checked time + verification badge, price comparison, read aloud |
| | `#/journey` | **My Journey**: Trip Readiness ring with explanation, chronological route-line timeline, conflict flags and fixes |
| | `#/checkout` | Booking and payment summary, simulated UPI/card, confirm step, confirmation |
| | `#/bookings` | Status tracking, policy-based cancellation, refund tracker, support tickets |
| | Assistant drawer | Multilingual chat, 🎤 mic, 🔊 speaker, language switch mid-chat, "show original", human escalation |
| **Tourism Partner** | `#/partner` | Login/registration, listings CRUD, price and availability calendar, enquiries with Partner Agent draft replies, bookings, revenue, conversion and cancellations, feedback |
| **Admin & Bank** | `#/admin` | Users and providers, bookings and GTV, complaints, refunds and SLA, partner performance, destination demand, financial products (escrow, T+1 settlement), language and support analytics, platform health |
| **Business case** | `#/insights` | Problem, survey evidence, personas, Case Q1–Q5, revenue model, social-mandate guardrails, UTAUT, VRIO, Sense–Seize–Transform, roadmap |
| **How it works** | `#/about` | Agent architecture, BHASHINI pipeline, data and verification rules, what is simulated vs real, privacy (DPDP) |
| **Settings** | `#/settings` | Optional Gemini key, AI mode, voice support check, reset demo data |

Demo logins are prefilled on each login screen (traveller, partner P-101, admin/bank).

### AI agents (`js/agents/`)
| Agent | Role in the prototype |
|---|---|
| Orchestrator | Plans the task, dispatches specialists, merges results, decides when a human must confirm |
| Multilingual Communication | Detects language, translates queries and responses, **protects** PNR, train no., station codes, ₹ and dates, voice in/out |
| Research | Looks up the (simulated) provider catalogue; records **source + checked time** |
| Verification | Independently re-checks against the provider source; flags changed, stale, missing or sold-out data |
| Recommendation | Ranks by budget, distance to station, rating and preferences |
| Itinerary | Builds the chronological plan around train timings; detects conflicts |
| Customer Support | Answers booking, cancellation and refund questions with policy citations; escalates to a human |
| Partner | Drafts enquiry replies for partners (partner confirms before sending) |

**Agents never invent prices, availability, ratings or timings.** Values come only from the catalogue, and anything
that can't be verified is shown as *Needs confirmation* or *Unavailable*.

### Languages
English, हिन्दी, বাংলা, मराठी, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, ગુજરાતી, ਪੰਜਾਬੀ, ଓଡ଼ିଆ.
English and Hindi are fully translated. The other nine cover the core journey (navigation, search, results, timeline,
readiness, statuses, assistant), and the remaining text falls back to English.

---

## 🤖 Optional: live AI with Gemini

The prototype runs fully **without** any API key, using deterministic simulated agents. To try live language understanding
and phrasing:

1. Open **Settings** (⚙️ in the header).
2. Paste your Gemini API key → **Test key** → Save.

The key is stored **only in your browser's localStorage**, is sent only to Google's Gemini API, and is **never committed to this repo**.
If a call fails or times out, the app silently falls back to the simulated agents, so a demo never breaks because of Wi-Fi.
Gemini is used only for language. Prices and timings always come from the verified catalogue.

> 🔐 Never paste an API key into code, commits or chat. If a key has been shared, rotate it in Google AI Studio / Cloud Console.

### Voice
- **Speech-to-text** uses the browser's Web Speech API (Chrome or Edge, with mic permission).
- **Read-aloud** uses the system's voices. For Hindi on Windows: *Settings → Time & Language → Speech → Add voices → Hindi*.
- No mic? Use the **sample voice query** buttons, which simulate the transcription.
- If a voice isn't available, the app says so and shows the text instead.

---

## 🗂 Project structure
```
index.html              app shell (open this)
css/                    base.css (design tokens) · traveller.css · dashboards.css
js/core/                util · store (localStorage) · i18n (11 languages) · ui · router (hash routes)
js/data/                travel.js (simulated catalogue) · analytics.js (simulated KPIs) · survey.js (real survey stats, N=52)
js/services/            language.js (BHASHINI-ready layer: ASR/NMT/TTS/transliteration, simulated) · gemini.js (optional)
js/agents/              agents.js · orchestrator.js
js/lib/charts.js        dependency-free SVG charts
js/views/               one file per screen
js/tour.js              guided jury demo
docs/                   ARCHITECTURE.md · VERIFICATION.md · research/ (requirements, business case, course frameworks, survey stats)
tests/                  automated end-to-end tests (Playwright)
```

## 🔁 Reset
Settings → **Reset demo data** clears journeys and bookings. You can also clear the site data in your browser.

## How this was built
Six AI agents built this prototype:
- **Three explorers** studied the BRD and brief, the survey and case, and the course decks. Their notes are in `docs/research/`.
- **Two builders** built the traveller/AI side and the dashboards/business-case side in parallel, to the contract in `docs/ARCHITECTURE.md`.
- **An independent verifier** tested it end to end and checked it against the requirements (`docs/VERIFICATION.md`).
