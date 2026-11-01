# Explorer 3: Course frameworks, and how IRCTC OneTrip should demonstrate them

Course: **"Business in the Digital Age"** (also "Business in Digital Age"), PGDM/PGDM (BM) 2026–2028, SPJIMR. The DTB lecture is by **Prof Ashish Desai**. The GenAI and agentic decks are by **Prof Abhishek Kumar Jha**, Assistant Professor at SPJIMR, who also teaches Maker Lab, GenAI for Business and Agentic AI.

Method: I used text extraction plus OCR on every page. Session 2, Session 4 and most of the GenAI deck are image-only slides. I also viewed key slides as images.

**Important finding:** `PGDM 2026.pdf` is NOT a course outline or rubric. It is Prof Jha's 70-slide lecture "Artificial Intelligence and GenAI", covering embeddings, RAG, SLMs and model routing, and agentic workflows. **None of the five PDFs contains an evaluation rubric, marks split, poster/prototype criteria, demo length or submission instructions.** The only deliverable instruction comes from the case file: "In addition to the poster, each team must build a working prototype". The brief adds: "fully working, clickable website prototype … complete demonstration of the journey…". So we should infer the evaluation lens from the frameworks the professors teach (section 2).

---

## 1. Deck-by-deck summary

### A. Lecture "Business in Digital Age" (Prof Ashish Desai, 81 slides)
- **Growth theory:**
  - Romer: ideas are non-rival, giving increasing returns; "capital and labor plateau, ideas don't".
  - Aghion–Howitt: creative destruction.
  - "Two engines of growth: Scaling ideas vs Competing ideas", which gives the "Open Growth Model / Inclusive Growth".
  - Policy reframe: "how do we accelerate the production and diffusion of ideas?"
- **Discovery → Invention → Innovation**, and "Cascading Innovation".
- **"Commerce rests on three fundamental flows"**: Information exchange, Money exchange and Transportation of goods. "DPI powers information and money exchange, while Gati Shakti powers the movement of goods."
- **Digital goods framework:** rivalry vs excludability. Open standards such as UPI and ONDC vs proprietary iOS/Android.
- **DPI / India Stack layers:**
  - Presence-less: Aadhaar.
  - Paperless: eKYC, eSign, DigiLocker.
  - Cashless: UPI, IMPS, AEPS.
  - Consent: Account Aggregator, DEPA.
  - Definition: *"an infrastructure-based approach that uses technology to achieve societal goals through an ecosystem (comprising technology, markets, and governance) built in the public interest that leverages competitive private innovation within regulatory guardrails."*
  - "DPI blends the trust of the state with the innovation of markets."
  - Five things DPI enables: rights/control over money and data; leapfrogging; market innovation through lower transaction costs and interoperability; inclusion of vulnerable groups; resilience.
- **Microservice / building-block features:** "Autonomous, Generic, Interoperable, Iterative evolvability".
- **Account Aggregator framework:** FIPs, FIUs, AAs and consent artefacts. "UPI creates a virtuous cycle, fueling data and driving credit growth" (UPI → credit). "From Banking Moats to Open Rails".
- **Data:**
  - "Data is the new competitive moat — whoever owns, integrates, and acts on it wins."
  - Five data types: Behavioural, Transaction, Demographic, Geographic, Psychographic.
  - "Customer Segmentation — Then and Now: From static demographics to dynamic behavior — data turns segmentation into precision targeting."
  - **"Data Flywheel Effect"**: Easy onboarding (open, real-time, interoperable rails, lower friction) → Rapid adoption → Data generation (high-frequency data, risk insights) → Engagement (users interact more, rely on tools, retention) → Network expansion (added users and merchants reinforce adoption) → back to onboarding. "More users create more data, enabling better decisions and accelerating continuous innovation."
  - "Data is Negative Rival Good."
- **Platforms:**
  - "The source of value is no longer ownership of assets; the source of value is orchestration of interactions." "Platforms win by connecting people, not by owning things." Examples: Uber, Airbnb, Amazon Marketplace.
  - Definition: *"A digital platform is a technology-enabled business model that facilitates interactions and value exchange among multiple groups of participants."*
  - **3 key layers:**
    - Technology: Cloud, APIs, Mobile Apps, AI/ML ("personalization, matching, recommendations and automation").
    - Governance: Rules, Standards, Trust ("identity, security and transparency"), Dispute Resolution.
    - Ecosystem: Buyers, Sellers, Developers, Partners, Regulators.
    - "Value is not created by the platform alone, but through the interactions of all participants in the ecosystem."
  - Platform types: 2-sided, then multi-sided (with Advertiser). B2C platforms (network effects, advertising) vs Industrial platforms (ecosystem efficiency, data + workflow effects).
  - Network laws: **Sarnoff (V = n)**, **Metcalfe (n²)**, and group-forming / Reed's law (NFX: subsets {A},{B},{A,B}…, so groups scale faster).
  - "Evolution of Business Models": Economy 1.0 Product, then 2.0 Service, then 3.0 Platform ("enable interactions among participants").
  - **Pipe vs Platform:** creates products vs creates connections; linear value chain vs value co-creation; assets matter vs ecosystem matters; internal resources vs external participants; scale through investment vs **scale through network effects**.
- **Identity:** "Platform and Login Design Principles: Digital identity evolves: Infrastructure → trust layer → ecosystem-wide economic engine". **"Why SSO matters"** chain: Identity → Trust → Participation → Transactions → Data → AI & Insights → Value Creation. "SSO reduces friction, builds trust, and unlocks the full potential of digital platforms."
- **Key line:** "Speed and precision no longer constitute competitive advantage; they are minimum entry requirements."
- **"Why Platform Fails":**
  - Orkut: failed to sustain engagement.
  - Nokia Ovi: failed developer ecosystem.
  - WeWork: "not really a platform, a linear business model".
  - **"COMMON MISTAKE: Building technology and calling it a platform."**
  - "Technology Alone ≠ Platform Success; Ecosystem Design + Governance + Network Effects = Platform Success."
  - "The greatest platform failures were not technology failures. They were ecosystem failures."

### B. Session 2: "Socio-Technical Matrix of Digital Transformation"
- **Core problem:** "Enterprise projects fail by treating software as isolated technical deployments"; there is a misalignment between design, behaviour and market maturity.
- **Three lenses:**
  1. **Digital Materiality & Affordance Theory**: "what the technology CAN do".
     - Atom-based vs bit-based materiality (Netflix DVD → cloud).
     - "Affordances are relational possibilities, not just features."
     - Mechanics: existence of materiality, perception of affordance, actualisation, constraint management (security/validation).
  2. **UTAUT**: "what users ACTUALLY do".
     - Performance Expectancy, Effort Expectancy, Social Influence and Facilitating Conditions drive Behavioural Intention and then Use Behaviour.
     - Moderators: Gender, Age, Experience, Voluntariness.
     - Uber India case: localisation collapse, then the fix of "cash payments, UPI wallets, Greenlight Hubs, **voice-guidance UI**".
  3. **Gartner Hype Cycle**: "what the market EXPECTS". Innovation Trigger → Peak of Inflated Expectations → Trough of Disillusionment → Slope of Enlightenment → Plateau of Productivity.
- **Triangulation dashboard:**
  - Materiality (micro): failure mode is feature-task mismatch.
  - UTAUT (meso): failure mode is user resistance (high EE / no FC); objective is "mitigate cognitive load".
  - Hype (macro): failure mode is speculative over-investment.
- **Indian cases:**
  - UPI: Plateau, zero EE, massive FC.
  - ONDC: Peak/Trough.
  - **Bhashini AI: Innovation Trigger. "Real-time multilingual voice APIs… Explicitly targets Effort Expectancy by removing text literacy requirements entirely."** This is directly relevant to us.
- **Good vs Bad Hype:** quick commerce vs Web3.
- **"Corporate Doom Loop"** ("We must deploy Enterprise AI by Q3!"): the frontline sees a complex UI with no training, and usage flatlines. The fix "strips 70% of UI fields, automates data", so EE drops and usage scales.
- **Mandates for the boardroom:**
  1. "Never Buy at the Peak".
  2. "Audit Digital Materiality First": affordances must map to real-world workflows.
  3. "Focus on Usability & Support Infrastructure… Executive mandates cannot fix broken software."

### C. Session 4: "Tech, Team and Strategy" (F1 / kitchen analogies)
- **Socio-Technical Systems (STS)**, "the Engine": "the tools we use and the people who use them… design the tools and the human incentives together."
  - Bad: a quick-commerce tracking algorithm leads to a strike.
  - Good: software that "serves the people, so the people use the software."
- **RBV / VRIO "Moat Filter"**, "the Armor":
  - Valuable: off-the-shelf stops here.
  - Rare: custom software.
  - Inimitable: "combine software with human trust".
  - Organized: "is your team ready to use it?"
  - "Having good software is just table stakes."
- **Dynamic Capabilities (Teece)**, "the Steering Wheel": **Sense, Seize, Transform** ("Burn the old boats before they sink").
- **Cases:**
  - SBI YONO: branches became digital onboarding hubs, with staff as guides.
  - Asian Paints: a 3D app plus retrained painters as consultants.
  - **BlackBuck: "multi-lingual voice app for drivers", FASTag, physical highway support hubs**. The uncopyable moat is "telematics data + payments + physical reach".
- **"3-Question Cheat Sheet"** (ask before approving any digital budget):
  1. **The Human Test** (STS): will frontline people want to use it?
  2. **The Copycat Test** (VRIO): can a competitor buy the same tool tomorrow?
  3. **The Survival Test** (Dynamic Capabilities): will it help us spot change early and pivot?

### D. "The Agent" (Agentic AI deck, Prof Jha)
- **Russell & Norvig agent:** Environment, Sensors, Actuators (tools), Effector ("brain").
- **LLM:** next-token prediction, autoregression. **Reasoning LLMs**: "think out loud", reasoning traces, train-time vs test-time scaling. "If you want fast and cheap responses, 'regular' LLMs are preferred."
- **"The Augmented LLM"** (cites Anthropic's *Building effective agents*): LLM + **Retrieval + Tools + Memory**.
  - **Memory:** short- and long-term. "Too much information can cause information overload… **Context engineering** addresses this by balancing the amount and relevance of information."
  - **Tools:** "The LLM can express the intent to use a tool, but it relies on us to turn that intent into an actual tool call" (JSON → tool + parameters).
  - **Planning:** **task decomposition** into a checklist plan; execute one step at a time.
  - **Reflection:** discover mid-plan that sources are insufficient, then **update the plan**.
- **"An Agentic System"** topics: **Autonomy; Agentic Applications; Responsible Agent Development and Usage; Evaluating Agents**. The deck ends at that agenda slide, but these are the evaluation themes.

### E. "Artificial Intelligence and GenAI" (`PGDM 2026.pdf`, Prof Jha)
- **AI Ladder:** "+AI → AI+". "+AI was about patching workflows with intelligence. AI+ is about reimagining workflows through intelligence… redesign processes from the ground up with AI at the core, letting agents handle the rote work and humans focus on judgment, strategy, and creativity."
  - Ladder steps: IA (collect, organize, protect data) → Add AI to your applications → Automate your workflows → Replace your workflows ("AI does the work").
- **"AI Washing"** ("Sell me this pen… IT'S AI POWERED"): beware of slapping an AI label on things.
- **ML** = "1) Find Pattern + 2) Apply".
- **Beyond UTAUT in the GenAI era:** the traditional assumptions break. These were: humans are users, humans define the input, consistent computing, **outcomes can be verified**, and there is an artificial interface.
- **Embeddings/vectors and cosine similarity**, including cultural context: "🚓 → 🍩 … but is this valid in Indian context? → 🍵". Localisation of AI matters.
- **Dense retrieval:**
  - Chunking → embed → index → search.
  - **Re-ranker**.
  - **RAG** = retriever + generator, with a vector DB and k chunks.
  - Multimodal RAG; **Text-to-SQL** RAG over databases.
  - Enterprise case: Morgan Stanley's advisor assistant.
  - "Better data makes better AI."
- **SLMs / distillation** (DeepSeek), then **Model Routing**: a router trained on benchmark data picks between a costly-powerful model, a mid general model and a small specialist. Uses HELM.
- **Agentic AI:**
  - "An agentic AI workflow is a process where an LLM-based app executes multiple steps to complete a task."
  - Example: draft V1 → web search → Draft V2 → **Editor AI** → V3 → **LinkedIn AI** → final. This is a writer/critic/specialist chain.
  - **"Degree of Autonomy: How much autonomy shall the AI have on the output?"** Low ↔ High.
  - **"Benefit of Agentic System: How we decide to break the task matters a lot."** HumanEval: GPT-3.5 non-agentic 48% and GPT-4 67%, vs agentic patterns (Reflection, Tool Use, Planning, Multiagent) at about 75–95%.

---

## 2. Evaluation criteria and rubric
- **No explicit rubric was found in any provided file.** Quoted instructions that do exist:
  - Case 13: *"In addition to the poster, each team must build a working prototype."*
  - Brief §9: *"We need a fully working, clickable website prototype with: Traveller interface. Partner dashboard. Admin dashboard. AI agent workflow. BHASHINI multilingual integration or a clearly labelled simulated integration for the demonstration. Responsive UI. Sample data. A complete demonstration of the journey from entering travel details to managing the final itinerary."* Also: *"The most important priority is to make the traveller's experience simple and inclusive: one journey, one dashboard, all travel arrangements and the ability to communicate in a language they understand."*
- **Inferred evaluation lens** (what these professors will probe):
  1. Is it a **platform** (multi-sided, governance, network effects) or "technology called a platform"?
  2. Does it lower **Effort Expectancy** and build **Facilitating Conditions** (UTAUT)?
  3. Does it pass the **Human / Copycat / Survival tests**?
  4. Is it **AI+** (redesigned workflow), not **AI washing**?
  5. Is the agent design sound: task decomposition, tools, memory, reflection/verification, an appropriate **degree of autonomy**, and responsible use with evaluation?
  6. Does it use **DPI rails** (identity/SSO, UPI, consent/AA, Bhashini) and data → bank/financial products?
  7. Does it answer the 5 case questions: solution gaps, data parameters, marketing, bank role, financial products?
- **Recommendation:** ask the team or professor for the actual poster/prototype rubric, demo time limit and submission format. I could not find them.

---

## 3. Framework → prototype mapping (concrete UI)

| Framework (deck) | How OneTrip shows it | UI element / label |
|---|---|---|
| Agentic workflow, task decomposition, planning (Agentic; GenAI) | Orchestrator shows a checklist plan that ticks off live | **"Agent Trace"** drawer: `Plan ☐ Research hotels ≤₹3,000 near CDG ☐ Research cabs ☐ Verify ☐ Build itinerary ☐ Recommend`. Steps tick as they run, with the agent avatar and ms timing |
| Multi-agent (orchestrator → workers) | 7 specialists with distinct avatars | Swim-lane graphic on the "How it works" page: Orchestrator → Research / Itinerary / Recommendation / Verification / Support / Partner / Multilingual |
| Reflection / plan update | Verifier finds stale or contradictory data, so the Orchestrator re-plans | Trace row: "⚠ Verifier: Hotel B availability stale (3h) → **Plan updated**: re-query source 2". Show a struck-through original step |
| Tool use ("intent → tool call") | Each worker step shows the tool call as JSON | Expandable "Tool call" chip: `{"tool":"hotel_search","city":"Chandigarh","max_price":3000,"near":"CDG"}` and its response with `source`, `checked_at` |
| Augmented LLM: Retrieval (RAG) | Support Agent answers cancellation queries **grounded in policy docs** and cites the chunk | Answer bubble with a "📄 Source: IRCTC Tourism Cancellation Policy §3 (sample)" citation and a "Retrieved 3 passages · re-ranked" note |
| Memory and context engineering | Short-term: chat context. Long-term: saved preferences (veg, budget, language) under user consent | "🧠 Memory" card in Preferences: "Remembered: Language Hindi, veg meals, budget ₹3k. [Forget]". Trace row: "Context: 4 of 12 facts used (relevance-filtered)" |
| Degree of autonomy / human-in-the-loop (GenAI slide 67–68) | AI researches and proposes; **the human confirms every booking, payment and cancellation** | An **Autonomy dial** in the Trace header: "Autonomy: Assist ▸ Propose ▸ (Act needs your OK)". A confirm modal: "Confirm booking? PNR/₹/dates shown unchanged" |
| Verification / "outcomes can be verified" (Beyond UTAUT) | Verifier cross-checks against 2 sources | Card badges: ✅ Verified (2 sources, 10:42) / ⚠ Needs confirmation / ✗ Unavailable. No invented values |
| Model routing / SLM (GenAI) | Router sends simple FAQs to a small model, planning to a reasoning model, and translation to Bhashini | Trace chip "Routed → Small model (FAQ)" vs "Reasoning model (itinerary)". Optional cost/latency note |
| Embeddings / cultural context | Recommendations localised: veg / Jain food, pilgrimage interest | "Why this?" chips: "Matches: veg, temple visit". The Indian-context point (🍵 not 🍩) |
| +AI → AI+ (AI Ladder) | Not a chatbot bolted on: the whole trip workflow is redesigned around agents | Hero/README line: "AI+ not +AI: one agentic journey replaces 5 apps". A small ladder graphic on the About page |
| Digital platform: 3 layers (DTB) | Tech (APIs, AI) + Governance (rules, verification, dispute/refund, trust) + Ecosystem (travellers, partners, bank, regulators, developers) | "Platform Architecture" panel on Admin/About: three coloured columns exactly like the slide |
| Multi-sided platform / pipe vs platform | Travellers ↔ hotel/cab/food partners ↔ bank ↔ (advertisers, labelled Sponsored) | Role switcher Traveller / Partner / Admin & Bank. A "Pipe → Platform" before/after graphic (ticket pipe vs journey platform) |
| Network effects (Sarnoff / Metcalfe / Reed) | More travellers bring more partners, which bring more choice and better recommendations | Admin KPI "Cross-side network effect": partners vs travellers line. Destination "groups" (pilgrimage, family, students) for Reed-style group effects |
| Data flywheel (DTB) | Onboarding (SSO) → adoption → journey data → engagement → network expansion | **"OneTrip Data Flywheel"** circular diagram on the Admin Insights page with live sample numbers at each node |
| 5 data types / precision segmentation (DTB) | Admin Data Governance view tags each field as Behavioural, Transaction, Demographic, Geographic or Psychographic, with its collection point (booking / journey / stay) | Table "Data parameters by journey stage". Segment chips "Pilgrim family", "Business solo"… (answers Case Q2) |
| DPI / India Stack (DTB, Session 2) | Presence-less: Aadhaar/DigiLocker ID reminder (mock). Cashless: UPI (simulated). Consent: AA-style consent for financial offers. Language: Bhashini | "Built on India Stack" strip in the footer/About: Identity · Payments (UPI) · Consent (AA/DEPA) · Language (Bhashini), each labelled *simulated* |
| SSO / identity as trust layer | One login across ticket, hotel, cab, food and bank products | Login screen "One IRCTC login for your whole journey". SSO chain graphic Identity → Trust → Participation → Transactions → Data → AI → Value |
| Consent layer / AA | Granular, revocable, time-bound consent toggles. Credit offers require AA consent | Consent artefact card: "Share travel history with Partner Bank for 30 days for a travel-credit offer [Allow / Deny] · revoke anytime" |
| UTAUT: Effort Expectancy | Voice-first, 11 languages, minimal fields, "Use sample trip" | Hero mic in Hindi. 3-field search. Readiness ring. A "Fewer steps" stat ("1 dashboard vs 5 apps") |
| UTAUT: Facilitating Conditions | Human support escalation, station help-desk / Yatri Mitra (like SBI YONO branches, BlackBuck hubs) | "Talk to a human" button. "Station help desk" card. Offline/low-bandwidth notes |
| UTAUT: Performance Expectancy | Saves time and money; price comparison | "You saved ₹420 and 3 app switches" summary on the itinerary |
| UTAUT: Social Influence | Ratings with source; "Popular with families from Kolkata" | Social-proof chips (sample, sourced) |
| Hype Cycle / Bhashini at "Innovation Trigger" | Honest maturity labelling; graceful fallback | Language selector shows "Beta" for weaker languages: "Voice not available in Odia yet: showing text". About page: "Where OneTrip sits on the hype cycle" (Slope, not Peak) |
| STS (Human Test) | Partner Agent helps small hotels (drafts replies, flags missing policy) and makes partners' work easier, not policed | Partner dashboard "Assistant suggestions". Copy: "Built for partners, not imposed on them" |
| VRIO (Copycat Test) | Moat = IRCTC's 82% ticket share + PNR-linked journey data + trust + Bhashini inclusion + bank partnership; not the code | "Why can't MakeMyTrip copy this?" VRIO card on About/poster: V ✓, R ✓ (PNR context), I ✓ (state trust + data), O ✓ (partner ops) |
| Dynamic Capabilities (Survival Test) | Admin demand signals: **Sense** (destination demand spike), **Seize** (launch package/partner campaign), **Transform** (new product) | Admin card "Sense → Seize → Transform": "Demand ↑ 38% Varanasi (Dev Deepawali) → onboard 12 homestays → launch package" |
| Three flows of commerce | Information (search/verify), Money (UPI/bank), Goods/Movement (train + cab) | Itinerary legend tagging each item with its flow |
| Microservice building blocks | Agents as autonomous, interoperable blocks | README architecture section using the "Autonomous, Generic, Interoperable, Iterative evolvability" wording |
| Why platforms fail | Show ecosystem health metrics, not just tech | Admin "Ecosystem health" tiles: partner retention, listing completeness, traveller repeat rate, dispute resolution SLA |

---

## 4. Vocabulary to use in UI labels and README
- **Agentic:**
  - Agentic workflow, Orchestrator, Specialist/worker agents, Augmented LLM, Tool use / tool call, Memory (short-term / long-term)
  - Context engineering, Planning, Task decomposition, Reflection, Plan updated, Reasoning trace
  - Degree of autonomy, Human-in-the-loop, Verification, Retrieval / RAG, Grounded answer, Re-ranker
  - Model routing, Specialist SLM, Evaluating agents, Responsible agent development
- **AI strategy:** **AI+ (not +AI)**, "reimagining workflows through intelligence", "agents handle the rote work, humans focus on judgment", avoid **AI washing**, "better data makes better AI".
- **Platform:**
  - Digital platform: "technology-enabled business model that facilitates interactions and value exchange among multiple groups of participants".
  - Multi-sided platform, orchestration of interactions, ecosystem, value co-creation, pipe vs platform.
  - Network effects (Metcalfe / Sarnoff / group-forming), technology / governance / ecosystem layers.
  - Trust, dispute resolution, SSO, digital identity as trust layer.
  - "Ecosystem Design + Governance + Network Effects".
- **Data:** Data flywheel, data as competitive moat, precision targeting, behavioural / transaction / demographic / geographic / psychographic data, consent-based data sharing.
- **DPI:**
  - Digital Public Infrastructure, India Stack, presence-less / paperless / cashless / consent layers, Account Aggregator, DEPA, UPI, interoperable rails.
  - "Trust of the state with the innovation of markets", "within regulatory guardrails", public value, financial inclusion, leapfrogging.
- **Adoption:** Digital materiality, affordances ("relational possibilities, not just features"), UTAUT (Performance Expectancy, **Effort Expectancy**, Social Influence, **Facilitating Conditions**), Hype Cycle stages, "mitigate cognitive load".
- **Strategy:** Socio-technical system, VRIO moat, "table stakes", dynamic capabilities **Sense / Seize / Transform**, Human Test / Copycat Test / Survival Test.

---

## 5. Pitfalls the professors flag, and how we address them
| Pitfall (source) | Prototype response |
|---|---|
| "Building technology and calling it a platform"; ecosystem failure (DTB, Why Platform Fails) | Working Partner and Admin & Bank sides, governance (verification, dispute/refund owner, ratings), ecosystem health KPIs |
| Orkut: failed to sustain engagement | Journey-long engagement (readiness ring, timeline nudges, return trip), not one-shot booking |
| AI washing ("IT'S AI POWERED") (GenAI) | Every AI claim is visible in the Agent Trace with real steps. No "AI" badge without a mechanism |
| Hallucination / unverifiable outcomes ("Outcomes can be verified" assumption breaks) | Verifier agent, source + timestamp on every fact, "Unavailable / needs confirmation" states, no invented prices or timings |
| Over-automation / wrong degree of autonomy | Agents research and propose. Human confirm on booking, payment and cancel. Autonomy dial. Escalation to human |
| Memory overload (context engineering) | Show only the relevant remembered facts. User can view and forget memory |
| High Effort Expectancy / missing Facilitating Conditions; "Corporate Doom Loop", complex UI (Session 2) | Minimal fields, voice, language-first, sample trip, help desk, human support. Ticketing stays one click away ("Continue to IRCTC ticketing") |
| Localisation collapse (Uber India); Indian-context embeddings | 11 languages, voice, UPI, veg/pilgrimage-aware recommendations, low-literacy flows |
| Hype: "Never buy at the peak"; Bhashini still at innovation trigger | Label Bhashini as simulated/beta. Fallback to original text. Show language availability honestly |
| STS: tech imposed on workers fails (quick-commerce strike) | Partner Agent assists partners; partner-side KPIs show their benefit (revenue, conversion) |
| Copycat risk: off-the-shelf software is table stakes (VRIO) | Articulate the moat: PNR/journey data + state trust + DPI rails + bank partnership |
| Privacy / consent (DPI consent layer, AA) | Consent toggles off by default, AA-style time-bound consent artefact, data-purpose table, aggregated partner analytics with small cohorts suppressed |
| Translation errors on critical data (brief) | Protected tokens (PNR, ₹, dates, train no.) highlighted and unchanged; policy text shown in the original as well |

---

## 6. Format, demo length and submission instructions
- **Not specified in any course deck.** Known: the deliverables are a poster plus a working prototype (Case 13). The brief requires a clickable website with Traveller, Partner and Admin views, an agent workflow, Bhashini (real or labelled simulated), responsive UI, sample data, and an end-to-end journey demo; all simulated data clearly labelled, with no real payments and no claimed live IRCTC integration.
- **Suggested demo script (about 5 min, an assumption):**
  1. Hindi voice query.
  2. Agent Trace with plan → research → verify (one flag and a plan update) → itinerary.
  3. Results with badges.
  4. Add to trip; Readiness ring.
  5. Confirm modal (HITL) and UPI (simulated).
  6. My Journey timeline.
  7. Support RAG answer in Hindi, with TTS.
  8. Partner dashboard.
  9. Admin: flywheel, India Stack, Sense-Seize-Transform, financial products.
- **README:**
  - A "Course frameworks applied" section mapping each screen to a framework (table in §3).
  - VRIO / 3-question cheat sheet.
  - Limitations (simulated).

## Alignment with Explorer 1 (explorer1_requirements.md)
Explorer 1 already specifies an Agent Trace panel, verification badges, the Bhashini pipeline chip, consent toggles, an Admin A7 Agent Monitor and an A8 Data Governance view. That fits this mapping well. Additions from this report, to layer on top:
- Plan checklist with "Plan updated" (reflection).
- Tool-call JSON chips.
- RAG citation in Support.
- Memory card.
- Autonomy dial.
- Model-routing chip.
- Admin: Data Flywheel, Platform 3-layer, India Stack strip, Sense-Seize-Transform card, ecosystem health tiles.
- About/README: VRIO moat, AI+ ladder and hype-cycle positioning.

Explorer 2's file was not present when this was written.
