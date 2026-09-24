# Investor Inbound: Verify or Discard

A 60-second filter for any unsolicited message claiming interest in investing in VibeLoom (cold email, LinkedIn DM, "family office," "capital advisory," "we represent an investor").

**Default prior:** unsolicited "we want to invest in you" outbound is guilty until verified. Real money makes you chase it; it does not cold-email you a Calendly link.

---

## Step 1 — 60-second triage

| Signal | 🟢 Plausibly real | 🔴 Discard |
|---|---|---|
| **Sender identity** | Named person + named fund, one consistent identity | "[X] Team," mismatched names across email/links/signature |
| **Specificity** | References your actual product, metrics, or market | Vague flattery: "your vertical," "your space," generic AI praise |
| **Firm footprint** | Real website, findable partners, portfolio | No firm name, no site; only "NY \| London \| Houston" geography |
| **The link** | Sent after a real exchange, matches firm domain | Calendly/Stripe link to a stranger; link text ≠ destination URL |
| **The ask** | "Let's talk," intro to their process | Any upfront fee, retainer, "engagement," or "refundable diligence deposit" |
| **Channel** | Warm intro, or fund's own domain | Free email (gmail) or lookalike domain; mass-blast `utm_campaign` tags |

One 🔴 in **Sender, Link, or The ask** = stop. Don't reply (a reply confirms a live address).

---

## Step 2 — The verification gate (if it survives triage)

Run all four before any call. Failing **any one** = discard.

1. **Identity** — Demand: firm legal name, the individual's full name + LinkedIn, firm website. Cross-check the person exists and works there.
2. **Registration** — A US firm raising capital for you is a broker-dealer or placement agent and must be registered. Ask for their **FINRA CRD number** and **Form CRS**; if an advisor, **SEC Form ADV**. Verify free at [FINRA BrokerCheck](https://brokercheck.finra.org) and [SEC IAPD](https://adviserinfo.sec.gov). No CRD / dodges the question = done.
3. **Domain** — Is the email from the firm's real domain, not a gmail or one-letter-off lookalike? Hover every link; if link text and destination differ, it's phishing.
4. **The money rule** — *Capital sources never charge the founder.* Family offices, VCs, and PE make money by investing. Any request for a retainer, engagement fee, success-fee-in-advance, escrow, or "refundable" due-diligence deposit ($5k–$30k is the typical band) is a hard stop, no matter how warm the call felt.

Quick gut-check: search `"<firm name>" scam`, and reverse-image-search the "Managing Director" headshot.

---

## Step 3 — Copy-paste reply (only if you choose to test them)

> Thanks for reaching out. Before I schedule anything, please send: (1) your firm's full legal name and website, (2) your full name and LinkedIn, and (3) your FINRA CRD number and Form CRS (or SEC Form ADV if you're an RIA). I verify all inbound on FINRA BrokerCheck before taking calls. For the record, we don't pay retainers, engagement, or diligence fees of any kind.

Legitimate intermediaries answer in minutes. Scammers go quiet. The silence *is* your answer.

---

## If money or credentials were lost

Report phishing to your email provider; if you paid, file with the [FBI IC3](https://www.ic3.gov) and [FTC](https://reportfraud.ftc.gov). If you clicked a link and entered anything, rotate that password and enable 2FA immediately.

---

### Why this works
The scam economy depends on volume and momentum: scrape founders, flatter them, manufacture "approval," then extract a fee. Every step of this filter removes the thing they need — your reply, your trust, your urgency, your money. Verification is cheap; a lost deposit and a burned week are not.
