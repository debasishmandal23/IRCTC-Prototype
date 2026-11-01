# Explorer 2: Problem, Customer Evidence and Business Case (IRCTC OneTrip)

Sources: Case 13 (case13.md), survey export (N=52, 28-31 Oct 2026, sheet "Form Responses 1"), BRD v2.0 sections 2-6, 15-17, 22-30, brief.txt.
All survey figures come from `/home/claude/research/survey_stats.json`, computed directly from the xlsx. Percentages use a base of N=52. Multi-select questions (Q4, Q6) do not sum to 100.

**Evidence status tags used below.** [CASE] means a case fact (period-specific). [SURVEY] means computed from the 52 responses. [ASSUMPTION] is an illustrative planning number and must be labelled as such in the UI. [BRD] means a position taken in the BRD.

**Important survey gaps (do not fake these in the UI).** The survey has no questions on language preference, voice usage, willingness to pay, age, city, trip purpose or party size. So a "language vs voice" cross-tab cannot be made. Multilingual/voice support is justified by the brief and the public-utility mandate, not by this survey. If the prototype shows language-usage charts, they belong on the Admin dashboard as clearly labelled *simulated* data, not on the Insights page as survey evidence.

---

## 1. Problem statement and evidenced pain points

**Problem (3 lines)**
1. IRCTC owns the start of a rail trip. [CASE] It has 82.68% of reserved bookings, up to 12.38 lakh tickets/day and 12.21 crore+ app downloads. Even so, ticketing contributes only ~30.33% of revenue.
2. Travellers then piece together their hotel, station transfer, food and sightseeing separately. Their hardest part is making arrival times fit with check-in and the other bookings.
3. OneTrip has to bring those pieces into one trusted trip, in the traveller's language, while ticketing stays fast, affordable and free of clutter.

**Pain points backed by numbers [SURVEY, N=52]**

| Signal | Figure |
|---|---|
| Book directly on IRCTC (website 42.3% + Rail Connect 36.5%) | **78.8%** (41) |
| Arrange at least one add-on (hotel/cab/food/insurance/tour) | **61.5%** (32); 2+ add-ons 21.2% (11) |
| Most-arranged add-on: hotel/accommodation | 30.8% (16); insurance 21.2%; local transport 19.2%; food 13.5%; sightseeing 9.6% |
| Report at least one specific planning difficulty | **67.3%** (35) |
| #1 difficulty: coordinating arrival time with check-in/other bookings | **36.5%** (19) |
| Other difficulties | local transport 23.1%; tracking multiple bookings 21.2%; finding accommodation 21.2%; comparing prices 19.2%; trust/refund terms 13.5%; discovering activities 7.7% |
| Find organising a train trip difficult (4-5 on 1=very easy to 5=very difficult) | 30.8% difficult, 42.3% easy, mean 2.79 |
| OneTrip useful (4-5) | **55.8%** (mean 3.37) |
| Likely to explore if services are relevant, prices competitive and terms clear (4-5) | **69.2%** (mean 3.88; 38.5% gave "5") |
| #1 feature: journey + arrangements in one place | **36.5%**; local transport 23.1%; accommodation 21.2%; transparent terms 13.5%; sightseeing 3.8% |
| Biggest concern: unclear cancellation/refund/support owner | **23.1%**; provider reliability 21.2% (trust total **44.2%**) |
| Other concerns | prefer separate apps 15.4%; too many promotions 13.5%; prices 9.6%; data privacy 7.7%; none 7.7% |

**Cross-tabs that make the case**
- **People who feel pain want the product.** Among the 35 who report a real difficulty, 68.6% rate OneTrip useful (4-5). Among the 17 who do not, only 29.4% do. Mean usefulness is 3.60 vs 2.88.
- **Intent rises with trip complexity.** The share likely to explore (4-5) is 55.0% with 0 add-ons (n=20), 76.2% with 1 add-on (n=21) and 81.8% with 2+ add-ons (n=11).
- **Hotel arrangers are the beachhead (n=16).** Of these, 81.2% are likely to explore. Half (50.0%) cite arrival/check-in coordination, half cite finding accommodation, and half pick "one place" as the top feature.
- **Infrequent travellers value it most.** Those travelling once a year or less (n=20) give the highest usefulness score (mean 3.90, 70.0% top-2) and 75.0% are likely to explore. They are less practised and plan bigger trips. "A few times a year" travellers are the coolest group (41.2% useful).
- **Trust objectors are persuadable.** Of those whose main concern is refund/support ownership (n=12), 75.0% are still likely to explore. For provider reliability (n=11) the figure is 81.8%. Fixing trust is the unlock. The "prefer separate apps" group is the real sceptic: 62.5% likely, mean 3.25.
- **Difficulty to feature.** Of the 19 who cite coordination, 8 pick "one place" as most valuable, 5 accommodation and 5 transparent terms.

**Caveats to show in small print.** This is a convenience sample of N=52, weighted toward occasional travellers (only 7.7% travel monthly). 5 respondents ticked "none" together with a service in Q4, and 5 did the same in Q6. These are stated intentions, not observed conversion.

---

## 2. Personas (behaviour from survey segments; names, language and demographics are illustrative)

**P1. Sunita Sharma, the Hindi-speaking family traveller (New Delhi NDLS to Chandigarh CDG, sample train 12011, 2 pax). This is the anchor demo trip, aligned with Explorer 1 §5.**
- Segment proxy is "arranges hotel" (n=16): 81.2% likely to explore, mean usefulness 3.44.
- Pain: the train arrives at 11:05 (sample) but check-in is at 14:00, she needs a station cab with luggage, and she wants a hotel under ₹3,000.
- Most valued: one-place itinerary and hotel near the station. Concern: prices may not be competitive (top concern in this segment).
- OneTrip moment: she asks by voice in Hindi, "मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए" (I need a hotel near Chandigarh railway station up to three thousand rupees). The itinerary flags a ~3 h arrival/check-in gap and offers early check-in, a cloakroom or a Rock Garden visit in between.

**P2. Ramesh Iyer, the once-a-year pilgrim (Chennai to Varanasi, with elderly parents)**
- Segment proxy is "once a year or less" (n=20): highest usefulness (3.90), 75.0% likely to explore. Top pains are coordination (8), comparing prices (7) and accommodation (6).
- Top concern: who is responsible for refunds and support (6 of 20).
- Needs a Tamil interface and TTS read-out for his parents, a dharamshala/hotel near the ghats, an IRCTC pilgrimage package link, and trip protection.
- OneTrip moment: every card shows provider, refund owner and helpline. The refund policy is read aloud in Tamil, while PNR, fares and dates stay untranslated.

**P3. Arjun, the student or occasional traveller (Pune to home, a few times a year)**
- Segment proxy is "a few times a year" (n=17). This is the lowest-enthusiasm group (41.2% useful). Top concerns are preferring separate apps (5) and provider reliability (5).
- Usually arranges nothing extra or just insurance (6 of 17 picked insurance).
- Design implication: keep the ticket flow untouched and show *one* dismissible card. Offer value only when it is clear, such as a meal on a long journey or a shared station cab.

**P4. Neha Kulkarni, the frequent business traveller (every 2-3 months or more, n=15)**
- 73.3% likely to explore. Top pains are coordination (5), local transport (4) and tracking multiple bookings (4). 8 of 15 pick "one place" as the top feature.
- Notable concern: data privacy (3 of 15, the highest of any segment).
- Needs station transfer timed to the *actual* arrival (delay-aware), GST invoices, a co-branded card/rewards wallet, and a clear consent dashboard.

---

## 3. Answers to the 5 case questions (headline + bullets for the prototype)

### Q1. Solution review: "Right foundation, fragmented journey"
**What IRCTC gets right**
- It holds high-intent reach at the moment of booking: 78.8% of respondents book on IRCTC [SURVEY], and IRCTC has 82.68% of reserved bookings [CASE].
- Adjacent assets already exist: catering (1,250+ trains, 400 stations, 45.60% of revenue), tourism (pilgrimage trains carrying 5.48 lakh pax/yr), hotels, its own payment gateway and Rail Neer [CASE].
- Its first-party journey signals (origin, destination, date, frequency, co-passengers) are richer than any OTA's for rail.
- It carries public-sector trust.

**Gaps**
- Services sit in silos and no single trip view exists. The #1 pain is coordination (36.5%) and the #1 feature asked for is "one place" (36.5%).
- Accountability is unclear across providers. Refund/support owner (23.1%) plus reliability (21.2%) are the top concerns.
- Personalisation and destination services are thin, and OTAs (MakeMyTrip/Goibibo) already sell rail plus everything else.
- There is no language-inclusive, voice-first layer for non-English users. This gap comes from the brief and the mandate, not from the survey.
- Cross-sell risks friction: 13.5% name too many promotions as their top worry.

**Our answer:** OneTrip is an optional coordination layer that starts *after* ticket confirmation. It is a railway-anchored trip, not a generic OTA. The phasing follows the BRD: P0 dashboard and trust info, P1 transfers then hotels, P2 sightseeing and finance.

### Q2. Data parameters by touchpoint: "One journey ID, consented data at every touchpoint"
| Touchpoint | Parameters | Use | Control |
|---|---|---|---|
| **Search & booking** | origin/destination, train, class, quota, journey date, booking lead time, fare, party size (adult/child/senior), booking channel, language selected, voice vs typed query, repeat-route frequency | itinerary seed, demand forecast, group-sized options, language routing | minimum fields; no sensitive inference |
| **Payment** | method category (UPI/card/wallet), amount, success/failure, refund status, settlement ref | reconciliation, failure recovery, card/rewards eligibility | no card/bank credentials to IRCTC or partners |
| **Pre-journey planning** | saved trips, hotel/cab/package searches, budget entered, offer impressions/clicks/dismissals, insurance opt-in | relevance tuning, frequency caps | marketing consent, opt-out honoured |
| **Journey (in-train)** | running status, delay/ETA, platform, coach/berth (for meal delivery), e-catering orders and ratings, PNR status changes | delay-aware transfer re-timing, meal windows, disruption alerts | label data freshness; no continuous GPS |
| **Stay (destination)** | hotel booked, check-in/out, early-check-in need, price band, occupancy, local transfer pickup time and vehicle type, tour bookings | arrival/check-in gap detection, destination demand heatmap | share with partner only what fulfilment needs |
| **Post-trip** | ratings, complaints, refund turnaround, support resolution time, repeat booking, language/translation-quality feedback | partner scorecards, service recovery, BHASHINI quality monitoring | aggregated and de-identified for partners |

Data products: traveller trip profile, destination demand heatmap, partner scorecard, disruption trigger, campaign measurement.

### Q3. Marketing and advertising: "Moment-based, not mass"
**To travellers (permission-based, at most 1 card per stage)**
- Booking confirmed to Chandigarh: hotels within 2 km of the station for those dates, with the total price, provider and cancellation terms shown.
- Arrival 11:05 against check-in 14:00: an early check-in, cloakroom or lounge offer.
- Journey over 8 hours: a meal at the next e-catering station.
- Party of 4+ or seniors: an SUV transfer or an accessible room.
- Repeat pilgrimage route: an IRCTC Bharat Gaurav / pilgrimage package, sent only on opt-in and frequency-capped.
- Disruption or cancellation: refund and rebooking help only, **never an ad slot**.
- Deliver in the user's chosen language (BHASHINI NMT/TTS), with sponsored labels translated too.

**To partners (the "OneTrip Insights" ad/insights product)**
- **Demand Radar.** An aggregated arrivals heatmap by destination, date and origin market, with lead times. It suppresses cohorts under k=50.
- **Sponsored Stay/Ride.** Labelled placements on a CPC or cost-per-booking basis. Relevance gates apply: paid placement cannot outrank a better-rated, cheaper option by more than one slot.
- **Campaign Studio.** Partners set budget, dates, geography and inventory. IRCTC enforces eligibility and frequency.
- **Partner scorecard** covering impressions to views to bookings, cancellation %, complaint %, rating and refund TAT. Good scores earn ranking.
- KPIs: qualified reach, CTR, conversion, incremental bookings vs a holdout, dismiss rate, opt-out rate.

### Q4. Role of banks: "Banks run the money rails; IRCTC runs the trip"
- **Payment gateway / acquiring.** Bank-backed UPI, cards and net banking on IRCTC's gateway, with one checkout for ticket plus add-ons and split settlement.
- **Escrow / nodal account.** Traveller money for partner services is held in a bank escrow until the service is delivered (e.g. check-in confirmed). This makes refunds instant, from escrow, and directly answers the 23.1% refund-owner concern.
- **Partner settlement.** T+1 automated settlement net of commission, plus reconciliation reports and GST invoices.
- **Credit.** Partner working capital and invoice finance underwritten on consented OneTrip sales data. For travellers, small-ticket EMI or pay-later through a regulated bank/NBFC only.
- **Fraud, KYC and disputes** are handled by the bank: chargebacks, AML/fraud monitoring and video-KYC for partner onboarding.
- **Financial inclusion.** Bank Mitra/BC-agent assisted booking and basic accounts, with no requirement attached to rail access.
- **Responsibility matrix:** IRCTC owns the platform, trip and first-line support. The partner owns fulfilment and its refund obligation. The bank owns money movement, credit risk and financial grievances. The bank does not get the full itinerary by default.

### Q5. Financial products by segment (all KPIs are [ASSUMPTION], illustrative pilot targets)
| Segment | Product | One-liner | Mechanics | Illustrative KPI |
|---|---|---|---|---|
| Retail | **OneTrip Rewards Card** (co-branded RuPay/credit) | Earn on every rail, hotel and cab spend in one place | Bank issues it and owns risk. IRCTC funds partner-offer points; points work as fare/add-on discounts. Waives the gateway fee on tickets. | 2% of active OneTrip users carry the card in yr 1; card users have 1.5x the add-on attach rate |
| Retail | **Trip Shield** | One-tap cover for train delay, a missed hotel night and baggage | Licensed insurer underwrites it. Opt-in, never pre-ticked, about ₹49-₹99 per trip. Delay claims settle automatically from running-status data. | 8% opt-in on OneTrip trips; claim TAT under 72 h |
| Retail | **Trip EMI / Pay-in-3** | Spread a ₹10k+ family trip over 3 months | Bank/NBFC underwrites with an affordability check. Shown only on baskets above a threshold, with APR displayed. | Under 3% of eligible baskets; default rate under 2% |
| Tourism partner | **Settle-Fast + Escrow** | Paid T+1 after check-in, with no chasing | Bank escrow with auto-split commission and GST invoices | 90% of settlements by T+1; partner NPS |
| Tourism partner | **OneTrip Growth Line** | Seasonal working capital tied to your OneTrip sales | Bank credit line, with limits informed by consented 6-month booking history. Repayment as a % of settlements. | 300 partners in pilot; NPA under 3% |
| Tourism partner | **Smart POS / QR kit** | Accept every payment at the homestay or cab stand | Bank merchant account, QR/soundbox and EMI-on-POS | 70% of small partners digitally onboarded |
| Financial inclusion | **Yatra Saathi assisted booking** | Book your trip and open a basic account at a counter or kiosk, in your language | Bank BC agents at stations and post offices, with a voice-guided Hindi/regional flow. Account opening is optional. | 1 lakh assisted trips/yr; 20% of them open a first account |
| Financial inclusion | **Teerth Bachat** (pilgrimage recurring deposit) | Save ₹200/month toward a pilgrimage package | Bank RD linked to an IRCTC package and redeemable for a booking. Interest goes to the saver. | 50k RDs; 60% redeemed for trips |
| Financial inclusion | **Micro-partner Mudra link** | Small loans for a new homestay or e-rickshaw | Referral to the bank's Mudra/PM SVANidhi-type schemes, using OneTrip ratings as supporting evidence | Loans to 1,000 micro-partners; repayment over 95% |

Sequence (BRD 27.4): payment reliability and escrow come first, then rewards and insurance, then merchant tools, then partner credit. Traveller credit is last and is never the first monetisation lever.

---

## 4. Revenue model and jury metrics (ALL [ASSUMPTION], label as "Illustrative scenario")

**Revenue streams**
1. Commission (take-rate) on partner bookings: hotel, cab, tours, e-catering.
2. Partner ads and insights: sponsored placements (CPC/CPB) and Demand Radar subscription.
3. Payments: gateway/MDR share and escrow float income (via the bank partner).
4. Financial-product distribution fees: card acquisition fee, insurance commission, lending referral fee.
5. Own-inventory margin: IRCTC tourism packages, catering, Rail Neer.

**Unit economics per 1,00,000 ticket bookings** (in survey_stats.json under `illustrative_business_model`)

| Line | Base attach | AOV | Take-rate | Net rev |
|---|---|---|---|---|
| Hotel/stay | 3.0% | ₹3,750 (₹2,500 x 1.5 nights) | 12% | ₹13.50 L |
| Station cab | 4.0% | ₹450 | 10% | ₹1.80 L |
| E-catering | 5.0% | ₹250 | 15% | ₹1.875 L |
| Sightseeing | 1.0% | ₹1,200 | 15% | ₹1.80 L |
| **Total** | | GBV ₹1.55 cr | | **₹18.98 L (≈₹19 per booking)** |

- Scenarios per booking: Conservative ₹9.68 net / ₹78.8 GBV; **Base ₹18.98 / ₹155**; Upside ₹31.43 / ₹256.
- At 6 lakh tickets/day average (an assumption, about 48% of the case peak of 12.38 lakh): **Base ≈ ₹416 cr/yr gross commission on ≈ ₹3,395 cr GBV**. Conservative is ≈ ₹212 cr and Upside ≈ ₹688 cr. These figures are gross, before servicing, incentive, payment and refund costs.
- Basis: the hotel attach rate of 3% assumes ~1 in 10 of the 30.8% who usually arrange a hotel books it via OneTrip. The ₹3,000 hotel matches the brief's Chandigarh example. Take-rates are typical marketplace bands to be validated with partners.

**Metrics a jury cares about**
- **Attach rate** = bookings with at least 1 add-on ÷ ticket bookings. The base scenario implies about 13 add-on orders per 100 bookings (3 hotel, 4 cab, 5 meals, 1 tour), so roughly 8-12% of trips once overlap is removed, against 61.5% of respondents who already arrange some add-on elsewhere.
- **Take-rate** = net revenue ÷ GBV. Blended base is 12.2%.
- **AOV uplift** = trip basket ÷ ticket-only basket. If the average ticket is ₹1,000 [ASSUMPTION], a hotel attacher's basket becomes ₹4,750 (4.75x) and a cab attacher's ₹1,450 (1.45x). The platform-wide average is +15.5% (₹155 GBV per booking).
- **Funnel:** card seen to card opened to added to itinerary to paid. Survey stated intent is 69.2% "likely to explore", but plan on 10-20% opening the card in a pilot.
- **Guardrails** (as important as revenue): ticket booking time and success rate unchanged, dismiss rate, opt-out rate, complaints per 1,000 add-on bookings, refund TAT.
- **Inclusion:** % of sessions in non-English languages, voice-query share, assisted bookings.

---

## 5. Social mandate and risk guardrails
- **Ticketing stays fast.** OneTrip appears only *after* ticket confirmation, never inside the Tatkal or checkout flow. The KPI is zero change in booking-success rate or latency. Without this, IRCTC loses its licence to operate.
- **Affordability.** No dynamic pricing on rail fares through OneTrip, and the pricing politics in the case make this essential. Budget filters come first, a "lowest price" option is always shown, and there are no hidden convenience fees. Prices include tax.
- **No aggressive cross-sell.** At most 1 recommendation card per stage, frequency caps, a one-tap dismiss and "Sponsored" labels. Disruption messages carry no ads. (13.5% fear too many promotions; 15.4% prefer separate apps.)
- **Trust and accountability.** Each card shows provider, refund owner, support helpline and data timestamp. Escrow gives instant refunds. The Verification Agent badges every price. (Trust concerns total 44.2%.)
- **Data privacy (DPDP Act, 2023).** The model is consent first, with purpose limitation and data minimisation. A consent manager lets users withdraw at any time, and partners receive only aggregated data with k-anonymity. Data is stored in India and retention is time-limited. Users have rights to access, correct and erase their data. A grievance officer handles complaints, and children's data needs parental consent. Banks never get the full itinerary by default.
- **Language safety.** PNRs, train numbers, fares, dates and station codes are never translated. Policy text keeps the original alongside the translation, and a low-confidence translation goes to a human.
- **Financial safety.** Underwriting stays with regulated entities and nothing is pre-selected. APR is always shown, and no credit is offered from travel-pattern data alone. Inclusion products are never a condition of travel.

---

## 6. Insights / Business Case page: chart spec (data keys refer to survey_stats.json)

Header KPI tiles (all from `headline`, show "N=52 survey"):
**78.8%** book on IRCTC · **61.5%** arrange 1+ add-on · **36.5%** struggle with arrival/check-in coordination · **69.2%** likely to explore OneTrip · **44.2%** top concern is trust (refunds/reliability)

1. **"Where travellers struggle"** is a horizontal bar of `questions.difficulties.options`, sorted, with "No significant difficulties" in grey. The top bar is coordination at 36.5%.
2. **"What travellers already arrange"** is a horizontal bar of `questions.addon_services.options`: hotel 30.8%, insurance 21.2%, local transport 19.2%, food 13.5%, sightseeing 9.6%, none 44.2%.
3. **"Most valuable OneTrip feature"** is a bar of `questions.most_valuable_feature.options`. It sets MVP priority: one-place 36.5%, transfer 23.1%, hotel 21.2%.
4. **"Concept response"** is two stacked 1-5 distribution bars from `questions.usefulness` (55.8% top-2) and `questions.likelihood_to_explore` (69.2% top-2).
5. **"Pain drives demand"** is a grouped bar of `crosstabs.pain_vs_usefulness`, showing top-2 at 68.6% vs 29.4%.
6. **"More add-ons, more intent"** is a bar of `crosstabs.addon_count_vs_explore`: 55.0%, 76.2%, 81.8%.
7. **"What could stop adoption, and how we fix it"** is a bar of `questions.biggest_concern.options`. Pair each concern with its feature: refund owner to escrow plus a responsibility label, reliability to the Verification Agent, promotions to the one-card cap, privacy to the consent centre.
8. **Booking channel** is a donut of `questions.booking_channel.options`: website 42.3%, app 36.5%, others.
9. **Frequency vs usefulness** is a bar of `crosstabs.frequency_vs_usefulness`. Infrequent travellers score 3.90 (the highest).
10. **Illustrative revenue scenario** is a stacked bar from `illustrative_business_model.scenarios` (Conservative/Base/Upside, net revenue by line). It needs a prominent "ILLUSTRATIVE ASSUMPTIONS" badge and the basis text.
11. **Case context strip** [CASE]: 82.68% share, 12.38 lakh/day, 12.21 crore downloads, and a revenue mix of 30.33% ticketing and 45.60% catering.

Footnote on page: *"Survey: N=52 convenience sample, 28-31 Oct 2026, weighted toward occasional travellers; stated intent, not conversion. Revenue figures are illustrative assumptions. Language/voice metrics on Admin dashboard are simulated."*
