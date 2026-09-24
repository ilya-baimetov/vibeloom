# Program proposal — AI-code governance practice

> **For:** Ilya Baimetov (self) · **Date:** 2026-07-08 · **Status:** v1, pre-Phase-0
> **Derived from:** `validation-ai-first-transformation-consulting.md` (5-lens SVPG panel, verified sources). This document turns the panel's Revise verdict into an executable program.

---

## 1. Strategic thesis

You are not building a consulting business. You are building an **evidence factory with consulting revenue as its fuel**. The SDD category validated itself at platform scale (Spec Kit ~106k stars, AWS Kiro, [Tessl at $750M pre-product](https://www.crunchbase.com/funding_round/tessl-series-a--0781c754)) while leaving the governance/drift/audit layer unowned and unevidenced. The first person with quantified enterprise before/after numbers becomes the category's DORA. Every design decision below serves that: engagements are priced to close fast, scoped to produce publishable data, and contracted with publication rights.

Three principles, carried from the panel:

1. **Sell the felt pain, not your pain.** The buyer's felt pain is board narrative, audit cover, and visible quality evidence — not drift. Drift is what you *find*; audit-readiness is what you *sell*.
2. **Trust before reach.** Consulting is bought on reputation — [51.9% of buyers rule firms out before ever speaking](https://hingemarketing.com/uploads/hinge-research-referral-marketing.pdf). Every hour spent manufacturing trust assets (evidence, references, published data) outperforms an hour of outreach.
3. **Two motions, kept separate.** Motion A (revenue): tool-agnostic audits for Copilot-estate mid-market. Motion B (VibeLoom adoption): OSS/content inbound from agentic-mature teams — software companies welcome here. Do not force VibeLoom into Motion A engagements; offer it as optional phase 2 where the stack fits. Audit data feeds both motions.

---

## 2. The offer stack

| Tier | Offer | Price | Duration | Role | Status |
|---|---|---|---|---|---|
| **Lead** | AI-SDLC governance & audit-readiness assessment | **$12,500 fixed, public** (first 3 clients: $9,500 "founding" rate in exchange for anonymized publication rights) | 2–3 weeks | The wedge. Demand test, evidence generator, upsell seed | Build now |
| Downsell | "Governing AI-assisted development" leadership workshop | $4,000/day, 1–2 days | Half-day–2 days | In-conversation fallback when audit doesn't close | Materials derive from audit |
| Upsell | 90-day governance implementation retainer | $6,000–9,000/mo, 90-day term | Quarterly | Post-audit expansion only; implements the audit's roadmap | After 2+ delivered audits |
| Expansion (post-G1) | **"Governed build"** — fixed-scope internal system for an existing regulated client, delivered with audit-grade provenance (built with VibeLoom; traces ship as part of the deliverable) | $25,000–60,000 fixed | 4–8 weeks | Expansion for audit clients with a build backlog. Explicitly NOT a generic SMB app shop — see §8 risk 8 | Only after 2+ audits and only within the ICP |
| Deferred | Multi-month "transformation" program | — | — | Never sold cold; possible year-2 shape | Parked |
| Deferred | EU-compliance mode / certification / partner network | — | — | 2027+ (EU AI Act Annex III deferred to [Dec 2027](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)) | Parked |

**Why $12,500:** under the ~$25k delegated signature authority typical of the target buyer (no procurement committee), above the "cheap workshop" signal floor, and consistent with the panel's convergent range ($7.5–20k across four lenses). Fixed and public — a listed price removes a negotiation cycle and signals productization.

### 2.1 Lead offer spec — the assessment

**Name (buyer-facing):** *AI-SDLC Governance & Audit-Readiness Assessment*. Never "transformation," never "codæ," never "contract stack" in sales materials.

**Scope (fixed):**

1. **Quantified baseline** on 2–4 of the client's own repos: AI-assisted code share (PR metadata / Copilot telemetry where available), churn, duplication, complexity and static-warning trends, hotspot map — the CMU/GitClear metrics run on *their* code ([CMU MSR 2026](https://www.cs.cmu.edu/~ckaestne/pdf/msr26.pdf); [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research)).
2. **Governance gap assessment** against a named framework (anchor on NIST AI RMF + their existing SOX/MAR-style change controls) — policy, review gates, provenance, approval evidence.
3. **Board-ready narrative deck** — the artifact the buyer parades. This is the emotional close; the User lens was explicit: the buyer renews on "a governance document my infosec, internal audit, and compliance officers sign, plus a board-ready narrative."
4. **Audit-evidence design** — how approval traces and provenance records should work in their SDLC (VibeLoom *concepts*, tool-agnostic framing).
5. **90-day remediation roadmap** — priced actions; seeds the retainer.

**Delivery mechanics (designed for infosec friction):** offer a "we never touch your code" mode — client runs your collector script inside their environment, you analyze exported metrics. VDI-compatible. This single design choice removes the biggest procurement objection a solo vendor faces.

**Effort once productized:** ~8–10 working days (2 collection, 4 analysis, 2–3 reporting/presentation) → capacity ~1.5–2 audits/month alongside selling.

**Contract must include:** anonymized publication rights (benchmark aggregation + case study), or founding discount doesn't apply. No publication rights at full price is acceptable; at discount it is not. This clause is the flywheel — non-negotiable with yourself.

---

## 3. Target audience

### ICP (year 1)

| Attribute | Spec |
|---|---|
| Geography | US only (CAN-SPAM-safe outreach; drop "global" — Germany-style consent regimes make it a compliance trap) |
| Company size | 500–5,000 employees (mid-market; ~19,688 US firms have 500+ employees per [SBA](https://advocacy.sba.gov/wp-content/uploads/2024/12/Frequently-Asked-Questions-About-Small-Business_2024-508.pdf), your filtered universe ≈ 3,500–5,000) |
| Verticals (priority order) | 1. P&C / life insurance carriers · 2. regional banks & credit unions · 3. healthcare services · secondary: logistics, utilities |
| Engineering | 30–200 **in-house** engineers (not majority-outsourced), AI coding assistants deployed **≥12 months** — they must already own the pain |
| Economic buyer | VP Engineering / CTO / Sr Director IT — ~$25k signature authority |
| Second sponsor | CISO / internal audit — governance-gap data says they increasingly co-own this ([Checkmarx: ~70% of CISOs estimate >40% of code is AI-generated](https://checkmarx.com/blog/ai-is-writing-your-code-whos-keeping-it-secure/)) |
| Trigger signals | Copilot/assistant rollout announced 12–24 mo ago; job posts mentioning "AI adoption"; new CISO; audit findings on change management; board AI committee |

### Anti-ICP — do not pursue in year 1

F1000 (bought by GSIs/vendors under MSA — Citi runs 40k devs [directly with GitHub](https://www.americanbanker.com/news/citi-is-rolling-out-agentic-ai-to-its-40-000-developers)); companies with <20 in-house engineers (mostly outsourced IT); AI-curious greenfield orgs with no assistant deployed (no felt pain yet); EU-headquartered targets; software vendors *in Motion A* (they belong to Motion B).

---

## 4. Positioning and language

| Say | Don't say |
|---|---|
| "AI-SDLC governance & audit-readiness" | "AI-first transformation" |
| "Quantified evidence of what 18 months of AI-assisted coding did to your codebase" | "Contract-driven agentic engineering" / "codæ" |
| "Board-ready governance narrative your auditors will sign" | "Six-tier contract stack", "drift statuses", "derives_from edges" |
| "Works on your existing GitHub Copilot estate — nothing to install" | "Requires Claude Code or Codex" |
| "Fixed price, fixed scope, 2–3 weeks: $12,500" | "Engagement scoped after discovery" |
| "Author of an open-source governance methodology; here's the data" | "Trust me, I wrote a manifesto" |

Cold/warm email skeleton (subject + first line carry everything): reference their specific situation (assistant rollout date, vertical), attach the **sample audit artifact**, ask nothing but a 20-minute reaction. The artifact is the email; the email is just the envelope.

---

## 5. The program — phases and gates

**Operating cadence during Phases 0–1: ~60% selling / 40% building.** The binding constraint is not the toolkit — it's conversations. Timebox all product work; VibeLoom feature development is frozen except the collector toolkit.

### Phase 0 — Setup (weeks 1–2)

| # | Action | Output |
|---|---|---|
| 0.1 | **Warm-network audit** (day 1–2): list every person who can intro you to a VP Eng/CIO/CISO at a 500–5,000-employee US regulated company. | Named list. **Fork:** ≥20 intro paths → warm-first plan as written. <20 → weight the content/OSS arm heavier and add ~4 weeks to Gate G1. Be honest here; the whole channel strategy hangs on this number. |
| 0.2 | Build **ICP list v1**: 100 named companies (insurance first), each with buyer + CISO identified. Sources: NAICS filters, state insurance-carrier directories, LinkedIn. | Tracked list (spreadsheet/CRM-lite) |
| 0.3 | **Interview script** (goals: their words for the pain; which budget line; what they'd need to see; price reaction to $12.5k; who else signs). | Script + booking link |
| 0.4 | Start **collector toolkit**: repo-metrics analysis that runs on client infra (git history → churn/duplication/complexity/warnings/AI-attribution heuristics) + governance-maturity rubric. Timebox: 2–3 weeks part-time. | Runnable collector + report generator |
| 0.5 | Secure **one concierge pilot** repo (friendly company / design partner; free or nominal) — the only unpaid work permitted in this program. | Pilot agreement incl. anonymized publication |
| 0.6 | Trust assets: E&O + cyber insurance quotes (~$1.5–3k/yr, estimate), pre-packaged security-questionnaire answers, one-page service sheet, contract template with publication-rights clause. | Assets folder |
| 0.7 | Start email-domain warmup on a separate sending domain (2–4 weeks lead time) so the Phase-1 probe isn't delayed. | Warm domain |

### Phase 1 — Demand test (weeks 3–8)

| Arm | Action | Volume |
|---|---|---|
| **Interviews** (primary signal) | 15 problem-discovery interviews with ICP buyers. Every interview ends with two asks: "who else should I talk to?" and (where pain confirmed) "would a $12.5k fixed assessment be approvable from your budget?" | 15 by week 6 |
| **Concierge pilot** | Execute pilot audit (weeks 3–5); produce the sample board-ready artifact; write it up as published artifact #1 ("What 18 months of AI-assisted commits did to a real codebase" — anonymized). | 1 pilot + 1 publication |
| **Warm outreach** | Intro requests through the 0.1 list; LinkedIn posts of pilot findings; offer the artifact, not a meeting. | All intro paths worked |
| **Cold probe** (secondary, instrumented) | ≤300 sends, insurance vertical only, US-only, 3 waves, artifact attached, fixed-price audit offer. Track against [Belkins baselines](https://belkins.io/blog/cold-email-response-rates) (0.45% avg reply) to measure *your* delta. | 300 sends, weeks 4–8 |
| **Partner seeding** (borrowed trust) | Map 10–15 fractional-CISO/vCISO firms, IT-audit & compliance boutiques, and MSPs serving regulated mid-market. Pitch a referral/white-label version of the audit (15–20% referral fee). They hold the trust relationship you lack and have no capability to deliver this audit — complementary, not competitive. | 2 partner conversations/wk from week 4 |

### Gate G1 — end of week 8 (pre-registered; no renegotiating with yourself later)

| Signal by week 8 | Decision |
|---|---|
| **≥2 paid audits** (or 1 paid + 2 written LOIs) | **PASS** → Phase 2. Begin planning full-time transition. |
| ≥10 interviews done, ≥5 qualified meetings, ≥1 paid | **AMBER** → one 4-week extension, changing exactly one variable (vertical or price). Max one extension. |
| 0 paid audits and <3 qualified meetings | **KILL** the consulting motion. Keep VibeLoom as OSS/credibility asset; revisit only with a fundamentally different channel (e.g., partner/subcontract into firms holding MSAs). |

Cash cost to reach G1: <$5k (insurance, tooling, sending infra). Calendar: 8 weeks at ~15–20 hrs/wk (stretch to 12 if part-time hours are tighter).

### Phase 2 — Repeat the wedge (months 3–6)

Deliver 4–6 audits. Refine the productized methodology after each (target: 10 → 8 delivery days). Secure publication rights in every contract. Publish case study #1 and the **mini-benchmark**: "State of AI code governance, n=6 mid-market codebases" — this is the inbound engine and the category-author claim. Add the CISO co-sponsor motion (audit findings → security budget). First retainer upsell.

**Gate G2 — month 6:** ≥$60–100k cumulative revenue, ≥1 public case study, ≥1 retainer, and inbound leads > outbound leads in the trailing month → **go full-time**. Otherwise: stay part-time, re-price or re-vertical, reassess at month 9.

### Phase 3 — Flywheel (months 6–12+)

Inbound-led: benchmark report v1, 2–3 conference talks (insurance-tech and engineering-leadership circuits), retainers to ~30–40% of revenue. Motion B activates fully: VibeLoom adoption offered to agentic-mature inbound + audit clients whose stack fits; field-evidence pipeline feeds the codæ manifesto with named data. Explore: partner/subcontract channel into boutique firms; compliance-mode build starts ~mid-2027 against the Dec 2027 EU clock. Certification/franchise remains parked until ≥10 delivered engagements and recognizable category traction.

---

## 6. Economics (year 1, bottom-up)

| Stream | Volume × price | Revenue |
|---|---|---|
| Audits (phases 1–3) | 8–12 × $9.5–12.5k | $85–140k |
| Retainers | 2–3 × $6–9k/mo × ~4 mo avg | $50–90k |
| Workshops (opportunistic) | 3–5 days × $4k | $12–20k |
| **Total year 1** | | **$150–250k** |

Consistent with the Analyst's solo delivery ceiling ($210–280k/yr at ~135–140 billable days). Costs: insurance ~$1.5–3k, sending/CRM/data tools ~$2–3k, LLC/accounting ~$1–2k, conferences ~$3–5k → **<$12k**. Time-to-first-dollar: month 2–3 (founding-rate audit). This is deliberately not a get-rich year — the year-1 ROI is 6–12 quantified codebases, 2+ public case studies, and the benchmark report. Those assets are what make year 2 ($300k+ and/or the franchise path) possible.

---

## 7. Updated SVPG scorecard (revised program vs. original proposal)

| Risk | As written (2026-07-08 panel) | Revised program | Why it moves |
|---|:---:|:---:|---|
| **Valuable** | 2 | **3** | Repositioned to the buyer's felt pain (audit cover, board narrative, quantified quality evidence) with a named validation plan (15 interviews). Capped at 3 until ≥2 strangers pay — willingness-to-pay remains the program's central unknown. |
| **Viable** | 2 | **3** | Assessment economics close at solo scale (8–12 audits/yr within capacity; $12.5k under signature authority). Channel inverted to warm/evidence-first; cold email demoted to instrumented probe. Capped at 3 because the warm channel's yield is unmeasured until the 0.1 network audit and Phase 1. |
| **Usable** | 2 | **4** | Tool-agnostic delivery on the client's existing Copilot estate removes the platform disqualifier; "run the collector yourself" removes the infosec objection; buyer-facing artifact is a board deck, not methodology vocabulary. DDD/full-methodology deferred to Motion B. |
| **Feasible** | 3 | **4** | Audit productizable in 2–3 weeks from the existing engine/analysis skills; 8–10 delivery days per engagement; US-only outreach is compliance-safe; total cash at risk to Gate G1 <$5k. |

**Updated verdict: GO — on Phases 0–1 only** (commit ~8 weeks and <$5k to the demand test). Decision rule check: all four ≥3 ✓, two ≥4 ✓, no unrefuted fatal flaw (the fatal findings were conditional on the old motion, now replaced) ✓, biggest remaining risk (Valuable — WTP) has a named, pre-registered validation plan ✓. Confidence: **Medium**. Full-time commitment is *not* part of this Go — it sits behind Gates G1 and G2. What would flip it back to Kill: G1's kill row.

---

## 8. Risks and mitigations (carried forward + new)

| # | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| 1 | WTP doesn't materialize — interviews polite, wallets closed | High | Pre-registered G1 kill row; interviews ask the price question directly; founding rate lowers first-close friction | Open — the test itself |
| 2 | Warm network too thin to carry the channel | High | Week-1 network audit with explicit fork; content/OSS arm as substitute; publication #1 within 5 weeks regardless | Open — measured wk 1 |
| 3 | You under-execute sales (builder's gravity) | High | 60/40 cadence rule; VibeLoom feature freeze except collector; weekly self-dashboard (§10); every audit contains build work as a pressure valve | Standing guardrail |
| 4 | Vendor/incumbent squeeze reaches the audit layer | Medium | Move fast (12–24 mo window per panel); audit is small-ticket and cannibalizes seat-selling — structurally unattractive to vendors; benchmark data compounds as moat | Monitor quarterly |
| 5 | Pilot/audit data underwhelms (no dramatic findings) | Medium | CMU/GitClear base rates make nulls unlikely, but pre-commit to publishing honest results — "we measured and found modest drift" still positions you as the measurer | Accept |
| 6 | Goal conflict resurfaces (pushing VibeLoom into Motion A) | Medium | Two-motion separation is written policy; VibeLoom appears in Motion A only as optional phase-2 where client runs Claude Code/Codex | Standing guardrail |
| 7 | Solo seller-deliverer crunch after 2–3 concurrent wins | Low (yr 1) | Fixed 2–3-wk engagements, max 2/month; retainers smooth load; raise price before adding capacity | Revisit at G2 |
| 8 | Drift into a generic build shop ("I'll just build systems for SMBs") | Medium | Assessed 2026-07-08: generic AI-build for SMBs is the most saturated corner of the market (agency/freelancer oversupply + DIY substitution via Lovable-class tools + low-code defaults) and wastes the differentiated assets. Governed builds allowed only as post-G1 expansion for existing regulated ICP clients, never as the lead motion | Standing guardrail |

---

## 9. Guardrails — what NOT to do

No F1000 pursuit in year 1. No "transformation" language anywhere. No unpaid work beyond the single concierge pilot. No discounting below $9,500 (walk away instead — a buyer who won't pay founding rate won't renew). No multi-segment sends. No EU cold outreach. No VibeLoom-first pitching in Motion A. No quitting current income before Gate G2. No skipping the interview phase to "just start emailing" — the interviews produce the vocabulary the emails need. No renegotiating gates after the fact: the thresholds in §5 were set on 2026-07-08, before the data.

---

## 10. Weekly self-dashboard (Phases 0–1)

Track weekly, review Fridays: interviews completed (target 2–3/wk) · intro asks made · qualified meetings booked · probe sends + reply% vs 0.45% baseline · paid audits / LOIs · publication progress · % time selling vs building (target 60/40). Two consecutive weeks below target on interviews or asks = the builder's-gravity alarm (risk #3) — fix behavior before anything else.

---

## 11. Assets to build (checklist)

- [ ] Warm-network list (≥20 intro paths or fork triggered) — wk 1
- [ ] ICP list: 100 named companies + buyers — wk 1–2
- [ ] Interview script + booking link — wk 1
- [ ] Collector toolkit (client-runnable) + report generator — wk 1–3
- [ ] Concierge pilot secured → executed — wk 1 → 5
- [ ] Sample board-ready audit artifact (the sales weapon) — wk 5
- [ ] One-pager + public pricing page on vibeloom.ai (service sub-page, buyer language) — wk 2
- [ ] Contract template w/ publication-rights clause; E&O + cyber insurance; security-questionnaire pack — wk 2–3
- [ ] Warmed sending domain + 300-contact insurance list w/ verified emails — wk 1–4
- [ ] Published artifact #1 (pilot findings) — wk 5–6
- [ ] Case study #1 + mini-benchmark ("n=6") — Phase 2

---

## 12. Sources

All market figures inherit from the validation report (`validation-ai-first-transformation-consulting.md`), independently re-verified 2026-07-08. Key load-bearing: [Belkins cold-email benchmarks](https://belkins.io/blog/cold-email-response-rates) · [Hinge referral research](https://hingemarketing.com/uploads/hinge-research-referral-marketing.pdf) · [CMU MSR 2026](https://www.cs.cmu.edu/~ckaestne/pdf/msr26.pdf) · [DORA 2025](https://dora.dev/research/2025/dora-report/) · [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research) · [SBA firm counts](https://advocacy.sba.gov/wp-content/uploads/2024/12/Frequently-Asked-Questions-About-Small-Business_2024-508.pdf) · [EU AI Act deferral](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/) · [Checkmarx CISO data](https://checkmarx.com/blog/ai-is-writing-your-code-whos-keeping-it-secure/). Estimates without links (insurance cost, signature-authority thresholds, delivery-day counts) are labeled assumptions from panel persona experience — validate the first two in Phase 0.
