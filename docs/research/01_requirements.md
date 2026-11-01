# Explorer 1 — Requirements (BRD v2.0 + Brief) for IRCTC OneTrip prototype

Sources read in full: BRD "IRCTC Digital Travel Platform — Comprehensive BRD v2.0" (31 Oct 2026; Part I = v1.1 sections 1–22, Part II = sections 23–31), /home/claude/research/brief.txt, /home/claude/research/case13.md.
Shorthand: [BRD §x] = BRD section, [BR §x] = brief section.

**Key tension to know first.** The BRD is cautious. It says "The survey does not validate AI as a requirement" [BRD §21.8], defers sightseeing, advanced AI and live payments to P2 [§22.8], and lists live booking, payment and refunds as out of scope [§10.2]. The brief asks for 8 AI agents, BHASHINI voice, booking and payment summary, refund tracking, and a partner and admin/banking dashboard. **Resolution:** build everything in the brief, but frame it the BRD's way. That means a rail-first trip coordinator, with every item labelled SIMULATED, every price and timing carrying a source and timestamp, recommendations that can be dismissed, and no claim of a live IRCTC, BHASHINI or bank integration.

---

## 1. Requirement traceability list

Screens: T = Traveller, P = Partner, A = Admin/Banking, AG = Agents (trace panel), ML = Multilingual.

### 1a. BRD functional requirements (IDs kept)
| ID | Requirement (one line) | Pri | Screen |
|---|---|---|---|
| FR-01 | Create or select a sample trip (destination, dates, basic train details) | Must | T (Home search) |
| FR-02 | One consolidated view of journey details and the services the user saved | Must | T (My Journey) |
| FR-03 | Show the enabled categories (accommodation, local transport, tourism) and open their options | Must | T |
| FR-04 | Filter and rank offers by destination, dates and preferences; the rules can be explained ("Why this?") | Must | T + AG |
| FR-05 | Each offer shows provider, description, price or price basis, availability caveat and terms | Must | T (service card/detail) |
| FR-06 | Add or remove a service from the trip; the change shows in the trip view and lasts for the session | Must | T |
| FR-07 | Chronological itinerary when times are known; unknown times are never invented | Should | T (Timeline) |
| FR-08 | Clear handoff or simulated booking; never shown as a live transaction | Must | T (Checkout) |
| FR-09 | Set, change or clear preferences, and the recommendations update | Should | T |
| FR-10 | Skip or dismiss a recommendation without blocking trip management | Must | T |
| FR-11 | Label sponsored, partner, indicative and simulated content at the point of decision | Must | T, all |
| FR-12 | Useful / not-useful feedback on offers | Could | T → A |
| FR-13 | Log or simulate events: offer viewed, saved, dismissed, handoff opened, feedback | Should | A (analytics) |
| FR-14 | Show the provider identity; separate IRCTC-managed from third-party services | Must | T |
| FR-15 | Show cancellation/refund terms and the support owner; if missing, say "unavailable" and give a next step | Must | T |
| FR-16 | Dismiss or opt out of recommendations; a dismissed offer is not shown again that session | Must | T |
| FR-17 | Arrival/check-in timing context; flag timing conflicts and explain the basis | Should | T (Timeline/Readiness) |
| ECO-01 | Rail, tourism, hotel, catering and payment shown as connected but each one attributable | Must | T |
| DAT-01 | Journey data model covering booking, journey, stay and post-trip (source, purpose, owner, retention) | Must | A (data dictionary view) |
| DAT-02 | Consent, preference controls, opt-out, role-based partner access | Must | T (Settings), P |
| MKT-01 | Context-aware, frequency-capped recommendation shown after booking, not inside ticketing | Should | T |
| MKT-02 | Aggregated partner demand and campaign insights; small cohorts suppressed | Could | P |
| BNK-01 | Payment partner handoff; show the payment and dispute owner | Must | T (Payment summary) |
| BNK-02 | Keep bank-owned regulated products separate from travel discovery; name the issuer, lender or insurer | Must | T/P/A (Financial page) |
| FIN-01 | Optional retail rewards and insurance concepts (benefits, fees, opt-in) | Could | T |
| FIN-02 | Merchant finance concepts in the partner view, with the lender named | Could | P |
| FIN-03 | Financial inclusion information; banking never required for rail | Should | T/A |
| TRUST-01 | Every third-party offer shows provider, availability timestamp, price, cancellation/refund terms and support route | Must | T |
| CORE-01 | Protect core ticketing speed and reliability (guardrail KPI) | Must | A |

BRD NFRs that the build must respect:
- NFR-01: usable without instructions.
- NFR-02: screen transitions under 3 s.
- NFR-03: contrast, and status must not rely on colour alone. Pair every status colour with an icon and text.
- NFR-04/05: no real passwords, payment details or PNRs.
- NFR-06: if there is no data, show Unavailable rather than inventing it.
- NFR-07: confirmed, indicative, external and simulated labels.
- NFR-09: service cards and rules come from config/JSON.
- NFR-10: OneTrip is optional. Keep a "Continue to IRCTC ticketing" link.

Acceptance checklist [§16.2] for the demo:
- Create a trip.
- At least 2 categories.
- Recommendations change when inputs change.
- Inspect, save and remove an item.
- Planned, saved, confirmed and simulated states are told apart.
- Handoff is labelled.
- Recommendations can be skipped.
- No real credentials.
- Events are captured.

### 1b. Brief-derived requirements (new IDs)
| ID | Requirement | Pri | Screen |
|---|---|---|---|
| BR-T01 | Home page with journey search: source, destination, date, budget, typed or spoken | Must | T |
| BR-T02 | Login/registration (mock; no real password stored) | Must | T |
| BR-T03 | My Journey dashboard with timeline and Trip Readiness indicator | Must | T |
| BR-T04 | Hotel, cab, food and sightseeing recommendations | Must (sightseeing Could per BRD P2) | T |
| BR-T05 | Consolidated itinerary | Must | T |
| BR-T06 | Booking and payment summary (simulated) | Must | T |
| BR-T07 | Cancellation and refund tracking (status stepper) | Must | T |
| BR-T08 | Price comparison across providers | Must | T |
| BR-T09 | Booking status indicators (Saved / Simulated-confirmed / Cancelled / Refund in progress) | Must | T |
| BR-T10 | Audio playback of important instructions | Should | T/ML |
| BR-P01 | Partner registration/login | Must | P |
| BR-P02 | Upload and manage hotel, cab and tour listings | Must | P |
| BR-P03 | Manage price and availability | Must | P |
| BR-P04 | Receive booking enquiries | Must | P |
| BR-P05 | View confirmed bookings | Must | P |
| BR-P06 | Track revenue, conversion, cancellations | Must | P |
| BR-P07 | View customer feedback | Must | P |
| BR-A01 | Monitor registered users and providers | Must | A |
| BR-A02 | Bookings and transaction value | Must | A |
| BR-A03 | Complaints, refunds, partner performance | Must | A |
| BR-A04 | Destination-wise demand (heatmap) | Must | A |
| BR-A05 | Financial product performance | Must | A |
| BR-A06 | Language usage, translation quality, support performance | Must | A |
| BR-AG01 | Orchestrator assigns tasks to 7 specialist agents and combines their results | Must | AG |
| BR-AG02 | No invented prices, availability, ratings or timings; source and timestamp recorded; independent verification | Must | AG |
| BR-ML01 | Language selector in the header with the 11 languages | Must | ML |
| BR-ML02 | Mic (ASR) → text → recommendations in the same language | Must | ML |
| BR-ML03 | Speaker button (TTS) | Must | ML |
| BR-ML04 | Transliteration input (e.g. "hotel chahiye" → "होटल चाहिए") | Should | ML |
| BR-ML05 | Language detection | Should | ML |
| BR-ML06 | Switch language at any time and keep conversation state | Must | ML |
| BR-ML07 | Translation safeguards: protected tokens, original kept alongside, critical-policy verification, fall back to the original or a human | Must | ML/AG |
| BR-ML08 | Explain when a language or voice feature is unavailable | Must | ML |
| BR-UX01 | Blue/white with subtle orange, cards, timeline, mobile responsive | Must | All |
| BR-PR01 | Clearly label simulated data; no live IRCTC claim; no real payment capture | Must | All (global banner) |

---

## 2. Screen inventory

**Global header (all screens)**
- Logo "IRCTC OneTrip" with a "Prototype – simulated data" badge.
- Nav: My Journey · Explore · Support.
- **Language selector** (11 languages).
- Mic button and speaker toggle.
- Login/Avatar.
- Role switcher (Traveller / Partner / Admin), shown only for the demo.

**Footer**
- Disclaimer: "Academic prototype. Not affiliated with live IRCTC systems. BHASHINI integration simulated."

### Traveller
1. **T1 Home / Journey search**
   - Hero search: From, To, Date, Budget band, Travellers, Trip purpose (optional), Interests chips.
   - Big mic CTA with "Try: मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए".
   - "Use sample trip" button.
   - "Continue to IRCTC ticketing →" link (CORE-01).
2. **T2 Login/Register (mock)**
   - Name, mobile/email, preferred language, consent toggles: personalised recommendations, marketing, partner sharing (DAT-02). All off by default except the essentials.
3. **T3 Agent working view** (after search)
   - Live agent trace panel (see §3): steps stream in with a status icon each.
   - Progress: Research → Verify → Itinerary → Recommend.
4. **T4 Results / Explore**
   - Tabs: Stay · Station transfer/Cab · Food (e-catering) · Sightseeing.
   - Card fields:
     - provider name, plus an IRCTC-managed vs Third-party badge;
     - title, location / distance from station, price + basis (per night / per trip / incl. taxes?);
     - rating (with source), availability;
     - **verification badge**;
     - **source + "checked HH:MM"**;
     - cancellation summary, support owner;
     - Sponsored/Partner/Simulated labels;
     - buttons: Add to trip · Details · Dismiss · 👍/👎 · "Why this?"
   - Filters: price, distance, rating, free cancellation.
   - **Price comparison** drawer: same category, 3 providers side by side.
5. **T5 Offer detail**
   - Full terms, cancellation/refund policy (with original-language text if translated), fulfilment party, support contact.
   - Verification log for each field.
   - "Proceed (simulated)" button.
6. **T6 My Journey dashboard (centerpiece)**
   - Trip header: route, date, PNR (sample, labelled), train no/name, class, coach/berth (sample).
   - **Trip Readiness indicator** (ring %, plus a checklist: Ticket ✓, Stay ✓, Station→Hotel transfer ⚠, Meal ○, Return ○, Docs/ID reminder).
   - **Chronological timeline:** departure → onboard meal → arrival → transfer → check-in → sightseeing → return.
     - Each item has a time, its status chip and its verification state.
     - **Conflict flags** (FR-17), e.g. "Arrive 11:05, check-in 14:00 — 2h55m gap. Options: early check-in (needs confirmation) / luggage storage / cloak room."
   - Saved-items list with remove buttons. Total estimated cost.
7. **T7 Booking & payment summary**
   - Itemised lines: provider, price, taxes, status.
   - Total, and payment method choice (UPI / card / net banking, all simulated; no inputs for real numbers).
   - Payment/dispute owner (BNK-01).
   - **Confirm step modal** that repeats the protected tokens in the original form.
   - Simulated transaction ref "SIM-TXN-…".
8. **T8 Cancellations & refunds**
   - Per-item: cancel button → policy preview → confirm.
   - Refund stepper: Requested → Provider accepted → Bank processing → Credited (simulated).
   - Shows the refund owner and the expected window *as stated by the provider* (or "Unavailable").
9. **T9 Assistant / Support chat** (drawer on every page)
   - Chat bubbles show the translated text with a toggle to view the original English.
   - Speaker on each bubble, mic, language chip, "Talk to a human" escalation with ticket ID, and a confidence indicator.
10. **T10 Financial services (optional)**
    - Co-branded card, rewards wallet, trip protection, travel credit.
    - Each shows issuer/insurer ("Partner Bank – sample"), fees, opt-in, and "Not required for booking" (BNK-02, FIN-01/03).
11. **T11 Preferences & privacy**
    - Budget band, interests, accessibility needs, language, consent toggles, "Clear my preferences".

### Partner
- **P1 Login/Registration:** business name, type (Hotel/Homestay/Cab/Tour), city, GST (mock), contact, bank settlement (mock, masked).
- **P2 Listings manager:** table of listings with name, category, city, price, availability calendar/toggle, cancellation policy, photos, status (Live/Draft/Paused). Add/Edit form. The Partner Agent suggests completions and flags missing cancellation terms.
- **P3 Enquiries inbox:** traveller enquiry (anonymised), trip date, party size, language. The Partner Agent drafts a reply, which is shown auto-translated.
- **P4 Bookings:** confirmed and simulated bookings with ID, date, guest initials, amount, status.
- **P5 Performance:**
  - KPI tiles: views, qualified referrals, bookings, conversion %, cancellation rate, complaint rate, revenue, avg rating.
  - Funnel chart.
  - Aggregated demand by destination/date (small cohorts suppressed, "<10 hidden").
  - Campaign tool with a Sponsored label (MKT-02).
- **P6 Feedback:** ratings and reviews (translated, with the original kept).
- **P7 Finance for partners (FIN-02):** working-capital line, invoice finance, POS/equipment finance, merchant settlement package. "Offered by Partner Bank (sample), lender decides".

### Admin & Banking
- **A1 Overview KPIs:** registered users, active partners, bookings, GTV, ancillary attach rate, complaints, refunds pending, core-ticketing guardrail.
- **A2 Destination demand heatmap / bar chart.**
- **A3 Partner performance table / scorecards.**
- **A4 Complaints & refunds queue** with SLA and escalations from the Support Agent.
- **A5 Financial products performance:** by segment (see §6).
- **A6 Language & support analytics:**
  - usage by language;
  - ASR/NMT confidence;
  - translations sent to a human;
  - "original shown" fallbacks;
  - support resolution, first response time and escalation %.
- **A7 Agent monitor:** runs, verification pass/flag rates, sources and their freshness.
- **A8 Data governance view (DAT-01):** data dictionary with source, purpose, owner and retention, plus the role-based access matrix (Traveller / IRCTC / Bank / Partner).

---

## 3. AI agent spec (all simulated, deterministic rules over JSON)

The UI must show an **Agent Trace panel**. It is a collapsible vertical log of rows, each with an agent avatar, the action, its status (⏳ / ✓ / ⚠ / ✗), the time taken, and a "details" expand.

| Agent | Inputs | Outputs | Visible in UI |
|---|---|---|---|
| **Orchestrator** | Parsed intent {from, to, date, budget, party, prefs, language} | Task plan; merged, ranked, verified result set; final answer | "Plan: 1) Research hotels near CDG ≤₹3,000 2) Research cabs 3) Verify 4) Build itinerary 5) Recommend". It shows which agent got each task and a merge summary such as "6 found → 5 verified → 1 needs confirmation → top 3 shown" |
| **Research** | Task (category, city, constraints) | Raw options, each with `source`, `checked_at`, price, availability, rating, location, policy | "Queried: Simulated Partner Hotel API, IRCTC Tourism (sample) … 6 options, checked 10:42 IST" |
| **Itinerary** | Train timings (dep/arr), selected items, check-in/out times, transfer duration | Ordered timeline items plus conflicts/gaps | Timeline is built step by step; conflict ⚠ "Arrival 11:05 vs check-in 14:00" |
| **Recommendation** | Verified options, budget, prefs, dismissed list | Top-N with reason strings; sponsored items labelled | "Why this?" chips: "Within ₹3,000", "1.2 km from station", "Free cancellation", "Matches: veg food" |
| **Verification** | Research records plus a second (simulated) source | Per-field state: Verified / Needs confirmation / Unavailable; flags (outdated > X min, contradictory, missing) | Badge on each card. Expand to see "Price ₹2,800 matched in 2 sources ✓; availability last checked 3 h ago ⚠ stale; cancellation policy missing ✗" |
| **Customer Support** | User query, booking state, policy docs | Answer citing the policy, action proposal, escalation ticket | "Looked up booking SIM-BK-102 → policy: free cancel till 24 h → proposed action: Cancel (needs your confirmation)"; low confidence → "Escalated to human, ticket #SUP-…" |
| **Partner** | Listing drafts, enquiries | Completeness checks, suggested replies, price/availability alerts | In the partner portal: "Missing cancellation policy — listing can't go live", draft reply |
| **Multilingual (BHASHINI-simulated)** | Audio/text, selected language | ASR text, detected language, NMT to English, response NMT back, TTS audio, transliteration | Pipeline chip: 🎤 ASR (hi, conf 0.92) → 🔤 NMT hi→en → [agents] → NMT en→hi → 🔊 TTS. Protected tokens highlighted, e.g. `₹3,000` `CDG` `12011` |

Implementation notes:
- Speech: use the Web Speech API (`SpeechRecognition` hi-IN, `speechSynthesis`) where the browser supports it.
- Otherwise use a **scripted fallback**: a pre-recorded transcript of the Hindi example.
- Label it "BHASHINI (simulated) — live API requires registration/approval".
- Translations come from a pre-built string dictionary for the 11 languages: full UI in EN + HI, key strings for the others.
- For languages without content, show the "not available, showing English" notice (BR-ML08).

---

## 4. Data rules (enforce in code)

1. **Every price, availability, rating, timing and policy** is stored as `{value, source, checked_at, verification: "verified"|"needs_confirmation"|"unavailable", simulated: true}`.
2. **No invention.** If a field is null, render "Unavailable — contact provider" (NFR-06, FR-15). Agents may only pick from the dataset and must never generate numbers.
3. **Verification badges** (icon + text + colour):
   - ✓ Verified (green)
   - ⚠ Needs confirmation (amber)
   - ✗ Unavailable (grey)
   - Staleness rule: `checked_at` older than 6 h → needs_confirmation.
   - Contradiction between two sources → needs_confirmation, and both values are shown.
4. **Status labels:**
   - Planned / Saved / Simulated-confirmed / Cancelled / Refund-in-progress.
   - "A recommendation is not a booking; a saved item is not a confirmed reservation" [§15].
5. **Disclosure labels:** Sponsored · Partner offer · IRCTC-managed · Third-party · Indicative price · SIMULATED.
6. **Translation safeguards:**
   - Wrap PNR, train number, station code, dates, times, prices and booking refs in `<span class="protected" translate="no">` and pass them through unchanged.
   - Show the original-English booking block beside the translated text.
   - Cancellation, refund and payment text carries "Translated — verified ✓" or "View original"; if confidence is under the threshold, show the original and offer a human.
7. **Confirm before action.** A modal comes before book, pay, cancel or refund. It restates the action in the user's language with the protected tokens untouched, and offers "Confirm" / "Go back".
8. BHASHINI is the language layer only. It is never the source of truth for rail, hotel, cab or booking data [BR §7].
9. Privacy:
   - Consent toggles default off.
   - Partners see only aggregated or anonymised data.
   - The bank never gets the full itinerary [§26.1].
   - No real PNR, card or password fields (NFR-05). Inputs in mock payment are disabled and pre-filled with "XXXX".

---

## 5. Sample data

The **BRD names no specific trains, routes, hotels, cities or prices.** The only concrete scenario in either document is the brief's Hindi query: a hotel near **Chandigarh railway station up to ₹3,000**. Recommended dataset, labelled SIMULATED:

- **Anchor trip:**
  - New Delhi (NDLS) → Chandigarh (CDG), Shatabdi-type train, sample no. 12011, CC class.
  - Dep 07:40, arr 11:05 (illustrative; "Sample timing — not live").
  - Sample PNR `SIM-245-6789012`.
  - 2 travellers, date about 2 weeks from the demo date.
  - Return CDG → NDLS in the evening, 2 days later.
  - Builders: avoid presenting real train timings as fact. Keep the "sample" label.
- **Hotels (Chandigarh, 6):** ₹1,800–₹4,200/night, 0.5–6 km from CDG.
  - At least one over budget, which gets filtered out.
  - One with a missing cancellation policy → Unavailable.
  - One with a stale price → Needs confirmation.
  - One IRCTC-managed (sample), one Sponsored.
  - Check-in 12:00 or 14:00 so the conflict appears.
- **Cabs/transfers:** station → hotel (₹250–₹450, 3 providers for price comparison); full-day local (₹1,800–₹2,500); Kasauli/Shimla day trip.
- **Food:** on-train e-catering meal at a sample station (₹180–₹350); destination veg thali.
- **Sightseeing (Could):** Rock Garden, Sukhna Lake, Rose Garden. Entry fees "Unavailable / check source" unless a sample source is given.
- **Second scenarios** (optional, to show context-aware ranking): a pilgrimage route (e.g. Varanasi) and a family/group trip.
- **Cities for the demand heatmap:** Chandigarh, Varanasi, Jaipur, Goa, Shimla, Amritsar, Puri, Madurai. All counts are synthetic.

**Case facts that may appear on the Admin/About page, quoted exactly and attributed "as reported in case (period-specific)":**
- 82.68% share of reserved ticket bookings.
- Up to 12.38 lakh tickets/day.
- More than 12.21 crore app downloads.
- Ticketing 30.33% of revenue.
- Catering 45.60% of revenue.
- Catering in more than 1,250 trains and 400 stations.
- Pilgrimage trains: over 5.48 lakh passengers annually.

**Survey facts (N=52, convenience sample, 28–31 Oct 2026). Always show N:**
- 78.8% book directly via IRCTC (42.3% website, 36.5% Rail Connect).
- Top pain point: arrival/check-in coordination, 36.5%. Then local transport 23.1%, tracking multiple bookings 21.2%, finding accommodation 21.2%, comparing prices 19.2%, trust/cancellation 13.5%. "No significant difficulty": 30.8%.
- Usefulness 4–5: 55.8% (mean 3.37). Likely to explore 4–5: 69.2% (mean 3.88). Difficulty mean 2.79.
- Most valuable feature: consolidated view 36.5%, local transport 23.1%, accommodation 21.2%, transparent terms 13.5%, sightseeing 3.8%, none 1.9%.
- Biggest concerns: unclear cancellation/refund/support 23.1%, reliability 21.2%, prefer separate apps 15.4%, too many promotions 13.5%, prices 9.6%, privacy 7.7%, none 7.7%.
- Additional services arranged: accommodation 30.8%, insurance 21.2%, local transport 19.2%, food 13.5%, sightseeing 9.6%, none 44.2%.
- Earlier N=37 vs N=52: explore 64.9 → 69.2%, useful 51.4 → 55.8%.

**Decision matrix [§8.2] (illustrative):**
- Weights: Customer value 30, Feasibility 25, Cost 15, Data 15, Fit 15.
- Weighted scores: A 3.95, B 2.90, C 3.00, D (OneTrip) 3.90.

**KPIs:** the BRD sets **no numeric targets**. Names to show:
- Trip task completion, coordination task time, recommendation relevance.
- Qualified offer exploration, service conversion, incremental contribution.
- Core-flow guardrail, trust/privacy guardrail, trust comprehension, recommendation control.
- Qualified reach, engagement rate, conversion rate, partner value.

Any dashboard numbers are synthetic and must be labelled so.

---

## 6. Financial products and bank role (BRD §26–27)

**Bank role:**
- An enabler, not the marketplace owner.
- Provides: payments and settlement (UPI, cards, net banking, merchant settlement and reconciliation); co-branded propositions; traveller finance (pay-later only where legal and underwritten); partner finance; financial inclusion; fraud and risk; customer protection (chargebacks, grievance).

**Operating model:**
- IRCTC: platform, itinerary, recommendation governance, partner standards, first-level support.
- Bank: payments, regulated products, credit decisions, fraud, financial grievances.
- Partner: inventory, accurate price and availability, fulfilment, cancellations and refunds.
- Shared: SLAs, data-sharing agreements, escalation matrix, audit, scorecards.
- The bank does **not** get the full itinerary by default.

**Products (all "proposed concept, not an existing offering"):**

| Segment | Products | Safeguard to show |
|---|---|---|
| Retail Traveller | IRCTC co-branded travel card; travel rewards wallet/points; trip protection/travel insurance (licensed insurer); small-ticket travel credit (bank/NBFC) | Optional; fees, exclusions, reward expiry; no pre-ticked consent; APR disclosure, cooling-off |
| Tourism Partner | Working-capital credit line; invoice/receivables finance; POS/equipment finance; merchant payment and settlement package | No automatic lending based on ranking; transparent MDR/fees and settlement timelines |
| Financial Inclusion | Basic digital account access; assisted digital payment access; small-value productive credit; multilingual financial literacy and fraud awareness | No promise of an account; never collect PIN/OTP; rail access never conditional on banking |

**Priority sequence [§27.4]:**
1. Payment reliability, reconciliation and disputes.
2. Co-branded rewards and travel protection.
3. Merchant payment tools.
4. Working-capital and invoice-finance pilots.
5. Traveller credit and inclusion lending, last.

"Credit products should not be the first monetisation lever."

**Admin KPIs to monitor.** Derived from §25.3/§27.5. The BRD gives no values, so use synthetic ones.
- Payments: success rate, failure rate, refund turnaround, dispute/chargeback rate, reconciliation exceptions.
- Card/rewards: opt-in rate, active cards, rewards redeemed, partner-funded reward cost.
- Insurance: attach rate, claims raised/settled.
- Partner finance: applications, approvals, disbursed amount, partners on merchant settlement, settlement time, NPA/default (pilot).
- Inclusion: assisted payments, literacy modules completed by language, fraud reports.
- Net contribution after rewards, acquisition, servicing, fraud and default costs.
- Complaint rate per product.

---

## 7. Top 10 jury "wow" moments

1. **Hindi voice query.** Tap the mic and speak the brief's sentence. The transcript appears in Devanagari, the language is detected as Hindi, and the protected tokens ₹3,000 and Chandigarh/CDG are highlighted.
2. **Live agent trace.** The Orchestrator plans the work, then Research, Verification, Itinerary and Recommendation fire one by one with timestamps and sources.
3. **Verification catches problems.** One hotel is dropped ("price contradictory"), one is marked ⚠ "availability checked 7 h ago", and one shows ✗ "cancellation policy unavailable".
4. **Results in Hindi.** The speaker button reads the top recommendation aloud in Hindi. PNR, prices and train number stay unchanged, with a "View original" toggle.
5. **Timeline conflict detection.** "Arrive 11:05, check-in 14:00" is flagged, with three fixes. One click adds the station-to-hotel cab and the gap shrinks.
6. **Trip Readiness ring** climbs from 40% to 100% as the ticket, stay, transfer, meal and return are added.
7. **Mid-journey language switch** (Hindi → Tamil → English). The conversation and the itinerary keep their state.
8. **Confirm-before-act cancellation.** "Cancel hotel?" is shown in the user's language. A refund stepper follows, naming the refund owner (provider) and the payment owner (Partner Bank, sample).
9. **Partner and admin close the loop.** The simulated booking appears in the partner's bookings and enquiries (with a translated reply drafted by the Partner Agent). The admin heatmap and language-usage chart update.
10. **Trust by design.** Every card shows provider, IRCTC-managed vs third-party, sponsored label, Dismiss and "Why this?". A "Continue to IRCTC ticketing" link proves the core flow is untouched.

---

## 8. Gaps and ambiguities, with recommended resolutions

| # | Gap / conflict | Resolution |
|---|---|---|
| 1 | BRD says AI is not validated by the survey and that sightseeing and live payments are P2; the brief requires them | Build them, tag sightseeing "Could/Phase 2" in the UI, and present AI as "transparent rules + verification", not magic |
| 2 | No sample trains, hotels or prices in the BRD | Use the Chandigarh dataset in §5, every value labelled SIMULATED with source "OneTrip sample dataset" |
| 3 | No numeric KPI targets (deliberately) | Synthetic dashboard values with a "synthetic" label; show "Target: set after pilot" |
| 4 | "Booking and payment" vs out-of-scope live payment | Simulated checkout, no real input fields, SIM-TXN refs |
| 5 | Trip Readiness is undefined in the BRD | Use a weighted checklist: Ticket 30, Stay 25, Arrival transfer 20, Meal 10, Return 10, Conflicts resolved 5. Any ⚠ item counts at half weight |
| 6 | Staleness threshold is undefined | 6 h for price/availability; policies are always re-verified before confirm |
| 7 | BHASHINI access cannot be obtained for the demo | Web Speech API plus a scripted fallback, labelled "BHASHINI (simulated)". Pipeline names follow BHASHINI tasks (ASR, NMT, TTS, transliteration, language detection) |
| 8 | 11 languages but no translations available | Full EN + HI; key UI strings for the other 9; a "partial support" notice per language (BR-ML08) |
| 9 | Ownership of food services unclear (IRCTC e-catering vs partner) | Label meals "IRCTC e-catering (sample)" as IRCTC-managed, which shows the IRCTC-managed vs third-party distinction |
| 10 | BRD section numbering glitches (lists numbered 7–11, 18–23 in the pandoc output) and survey N=37 text still present in §21 | Use §22 (N=52) figures only; §22 supersedes §21 |
| 11 | Train number realism vs "no invented data" | Use realistic formats but a "sample" label on the trip header; never claim live running status |
| 12 | Admin "translation quality" metric is undefined | Show average ASR/NMT confidence, % routed to human, % "view original" clicks, and user thumbs on translations |

Overlaps with Explorer 2 and 3: their files did not exist when this was written. Expect Explorer 2's survey numbers to match §5 (they come from the same N=52 export), and Explorer 3's agent patterns to map onto the Orchestrator → specialists design in §3.
