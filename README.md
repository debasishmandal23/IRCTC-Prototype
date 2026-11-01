# IRCTC OneTrip — AI-powered, multilingual integrated travel platform (prototype v1.1)

> **One journey. One dashboard. In your language.**
> A working prototype for **Case 13 — "How should IRCTC expand its digital travel platform?"**
> (Business in the Digital Age, SPJIMR PGDM 2026–28).

OneTrip starts with the train: pick two stations and a date, see the trains, book one (simulated), and the
PNR becomes your journey. Then it plans the rest of the trip around the train: hotel, cab, food and sightseeing. AI agents research and *independently verify* every option. The
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

Click **Start demo** in the header. The 20-step guided tour drives the app by itself, so you only press **Next**:

1. **Sign in as a persona** (`#/login`): Sunita Sharma, a family traveller from New Delhi who prefers Hindi. The language,
   home city, party of 3 and preferences load automatically.
2. **For you, Sunita**: the long-weekend detector finds **Christmas (Fri 25 Dec 2026) → a 3-day weekend**. It shows where
   travellers from Delhi are going (aggregated, anonymised, simulated) and a train + hotel + cab + sight **package**.
3. Speak (or play the sample) *"क्रिसमस पर दिल्ली से चंडीगढ़ की ट्रेन बुक करो"* → the app replies **"I heard: …"** with chips
   (Intent, From, To, Date) and opens the **train results** for that date.
4. Book **12011 Kalka Shatabdi, CC** → passengers prefilled → fare summary → **human-in-the-loop confirm** → simulated payment →
   **PNR + e-ticket** (CNF / RAC / WL with a chance of confirmation).
5. **"Now plan your stay in Chandigarh"** → Agent Trace: Orchestrator → Multilingual → Research → **Verification** →
   Recommendation → Itinerary. The package hotel (*Hotel Shivalik View*, partner P-101) and cab are added.
6. **My Journey**: the ticket is the first item on the route-line timeline. The conflict between the **11:05 arrival** and the
   **14:00 check-in** is flagged; resolve it → Trip Readiness rises.
7. Checkout → confirm → booking refs. Assistant refund question in Hindi → 🔊 listen → escalate.
8. **Partner dashboard** shows the new booking; **Admin & Bank** shows the **long-weekend demand forecast**
   (the data-monetisation use case) and GTV; **Business case** closes the story.

Try typing any route in the home box, e.g. **"book from Chandigarh to Mumbai train"**, "चंडीगढ़ से मुंबई ट्रेन कल",
"hotel in Hyderabad", "status of my train", "refund kab milega".

Pre-demo checklist: see [`docs/VERIFICATION.md`](docs/VERIFICATION.md#jury-demo-checklist).

---

## 🧭 What's inside

| Interface | Route | Highlights |
|---|---|---|
| **Traveller** | `#/home` | **Step 1 · Find trains** (from/to station pickers, date, class, passengers), "type or speak a command" box with **I heard** chips, PNR import as a second path, sample voice queries, **For you** suggestions |
| | `#/trains?from=&to=&date=` | Simulated timetable for any of ~40 stations (typeahead in English and Indian scripts), classes, fares, availability (AVAILABLE / RAC / WL / REGRET), filters and sort, verification badge + source + checked time per train |
| | `#/trains/book`, `#/trains/ticket?pnr=` | Passengers (persona prefilled), fare breakup, confirm, simulated payment, PNR e-ticket, "plan your stay" CTA |
| | `#/login` | **Demo persona cards**: 4 travellers (Sunita · Delhi · Hindi, Ramesh · Chennai · Tamil pilgrim, Arjun · Pune · Marathi student, Neha · Mumbai · business), Partner P-101, Admin/Bank. The header user menu switches persona or signs out |
| | `#/results?to=` | Any destination station (generated, deterministic listings for cities outside the three scripted scenarios). Live Agent Trace, verified hotels, cabs, food and sightseeing, source + checked time + verification badge, price comparison, read aloud |
| | `#/journey` | **My Journey**: Trip Readiness ring with explanation, chronological route-line timeline, conflict flags and fixes |
| | `#/checkout` | Booking and payment summary, simulated UPI/card, confirm step, confirmation |
| | `#/bookings` | Train ticket with railway-style cancellation charge and refund, persona trip history, status tracking, policy-based cancellation, refund tracker, support tickets |
| | Assistant drawer | Multilingual chat, 🎤 mic, 🔊 speaker, language switch mid-chat, "show original", human escalation |
| **Tourism Partner** | `#/partner` | Login/registration, listings CRUD, price and availability calendar, enquiries with Partner Agent draft replies, bookings, revenue, conversion and cancellations, feedback |
| **Admin & Bank** | `#/admin` | Users and providers, bookings and GTV, complaints, refunds and SLA, partner performance, destination demand, **long-weekend demand forecast**, financial products (escrow, T+1 settlement), language and support analytics, platform health |
| **Business case** | `#/insights` | Problem, survey evidence, personas, Case Q1–Q5, revenue model, social-mandate guardrails, UTAUT, VRIO, Sense–Seize–Transform, roadmap |
| **How it works** | `#/about` | Agent architecture, BHASHINI pipeline, data and verification rules, what is simulated vs real, privacy (DPDP) |
| **Settings** | `#/settings` | Optional Gemini key, AI mode, voice support check, reset demo data |

Demo logins are prefilled on each login screen (traveller, partner P-101, admin/bank), and `#/login` offers one-click persona sign-in.

**For you, <name>** (home and My Journey): upcoming long weekends from a sample holiday calendar (weekdays computed with
`Date`; Tue/Thu holidays become 4-day weekends with one day of leave), "Trending from <home city>" with aggregated,
anonymised counts, % change and "fills N days early", and a priced package per trend. "Why am I seeing this?" explains the
data used; a DPDP consent switch hides the section. All demand data is simulated.

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
js/data/                travel.js (simulated catalogue) · rail.js (stations, timetable, fares, PNR) · cities.js (any-city listings) · personas.js (personas, holidays, demand) · analytics.js (simulated KPIs) · survey.js (real survey stats, N=52)
js/services/            language.js (BHASHINI-ready layer: ASR/NMT/TTS/transliteration, simulated) · gemini.js (optional)
js/agents/              agents.js · orchestrator.js
js/lib/charts.js        dependency-free SVG charts
js/views/               one file per screen
js/tour.js              guided jury demo
docs/                   ARCHITECTURE.md · VERIFICATION.md · research/ (requirements, business case, course frameworks, survey stats)
tests/                  automated end-to-end tests (Playwright): `python3 tests/e2e.py` runs file:// and http at 1440 and 375 px
```

## 🔁 Reset
Settings → **Reset demo data** clears journeys and bookings. You can also clear the site data in your browser.

## How this was built
Six AI agents built this prototype:
- **Three explorers** studied the BRD and brief, the survey and case, and the course decks. Their notes are in `docs/research/`.
- **Two builders** built the traveller/AI side and the dashboards/business-case side in parallel, to the contract in `docs/ARCHITECTURE.md`.
- **An independent verifier** tested it end to end and checked it against the requirements (`docs/VERIFICATION.md`).
