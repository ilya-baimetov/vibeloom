# Adversarial Review the Site

A prompt for Claude Code or an equivalent agentic coding tool. Runs a systematic adversarial review of the VibeLoom marketing site, then walks every issue with the user before editing.

The goal is not generic web critique. The goal is to make the site concise, credible, technically correct, aligned with canon, and strong enough to explain VibeLoom to a skeptical visitor.

**Time budget.** Audit packet: 1-2 hours. Interactive fixes: 1-3 minutes per issue, longer for messaging decisions.

---

## Purpose

Audit the marketing surface:

- `v03/site/public/*.html`
- `v03/site/public/styles.css`
- `v03/site/public/robots.txt`
- `v03/site/public/sitemap.xml`
- `v03/site/public/llms.txt`
- public assets referenced by the pages
- `v03/vibeloom-comparison.html` if present

Read canon as source-of-truth evidence:

- `v03/codæ-manifesto.html`
- `v03/vibeloom-methodology.md`
- `v03/vibeloom-implementation.md`

Produce a prioritized adversarial issue packet. Each issue must explain why it matters, present 2-3 bounded fix options, recommend one option with rationale, and define how the fix will be verified. Then walk the user through every issue before applying edits.

## Preconditions

- Site files exist.
- Inspect `git status --short`; do not require a clean tree, but record unrelated dirty files and avoid reverting them.
- Start a local static server when visual or HTTP checks are needed.
- Browser screenshots are preferred for layout checks, but static parsing and local HTTP checks are valid fallbacks when browser tooling fails.
- Do not commit unless the user explicitly asks.

## Adversarial Review Protocol

Run these passes in order. Do not edit until the issue packet is ready and the user chooses the first issue.

### 1. Surface Map

Build a compact map of the site:

- Page inventory and role of each page.
- Navigation/footer consistency.
- Primary claim, CTA, and intended visitor action per page.
- Load-bearing claims and their canon or evidence basis.
- Metadata, canonical URLs, sitemap entries, robots directives, `llms.txt`, JSON-LD, and major assets.

Write or update `site-review-packet.md` with the map summary. Keep it concise.

### 2. Attack Passes

For each pass, look for concrete findings with file/element evidence.

**A. Canon alignment**

- Site claim contradicts canon.
- Site claim has no canon basis and is not clearly marked as roadmap or positioning.
- Site uses stale terminology from an older VibeLoom version.
- Site implementation explanation drifts from `vibeloom-implementation.md`.
- Public manifesto excerpts diverge from the canonical manifesto without being labeled as an excerpt or adaptation.

**B. Messaging quality and concision**

- The first viewport does not clearly communicate the category, problem, and why VibeLoom is different.
- Headlines summarize canon instead of selling the value.
- A section repeats another section without adding a new decision point for the visitor.
- Competitive claims are too broad, too negative, or insufficiently sourced.
- Dated evidence overwhelms the product narrative or requires fragile maintenance.

**C. Public web integrity**

- Duplicate public pages compete for the same concept without canonical/noindex/redirect strategy.
- `sitemap.xml`, `robots.txt`, or `llms.txt` is stale or incomplete.
- Canonical links are missing, duplicated, or wrong.
- JSON-LD includes stale, risky, or overly broad claims.
- Local links, external links, or cross-page fragments are broken.

**D. UX, accessibility, and responsive behavior**

- Navigation or footer differs across pages.
- Active nav state is wrong or missing.
- CTA labels and destinations are inconsistent.
- Heading hierarchy, skip links, focus order, or alt text fail basic accessibility.
- Mobile layout has overflow, cramped touch targets, or comparison content that cannot be scanned.

**E. Visual and brand consistency**

- Visible category language is inconsistent.
- Brand tokens, typography, spacing, or wordmark treatment drift across pages.
- Visual density does not match page intent: marketing pages can be punchy; implementation pages can be denser but still scannable.

**F. Known v03 failure probes**

Explicitly check these classes even if the broad checklist seems to cover them:

- Stale `llms.txt` content.
- Duplicate manifesto URLs or duplicate manifesto content.
- Broken links from site pages to markdown files not published in `site/public`.
- Broken cross-page fragments.
- Over-aggressive competitor claims in homepage, comparison table, FAQ, or JSON-LD.
- Hero animation or copy that weakens "contract-driven agentic engineering."
- Footer/category copy drift.
- Implementation page runtime claims that over-specify or contradict canon.

### 3. Finding Quality Bar

Every finding must include:

- `id`: `SITE-001`, `SITE-002`, etc.
- `severity`: Critical, High, Medium, or Low.
- `location`: exact file and element/section; include line numbers when practical.
- `issue`: what is wrong.
- `why it matters`: the consequence for credibility, conversion, accessibility, SEO, AI readers, or canon alignment.
- `fix options`: 2-3 options, each with the tradeoff.
- `recommended fix`: one option and why.
- `verification`: link check, metadata check, screenshot, local HTTP check, or source inspection.
- `canon impact`: whether this is site-only or should trigger canon review.

Reject vague findings such as "make punchier" unless the finding names the weak copy and gives concrete fix directions.

### 4. Priority Rules

Walk findings in this order:

1. Public correctness defects: broken links, stale `llms.txt`, duplicate canonical surfaces, wrong sitemap/robots.
2. Canon contradictions and unsupported claims.
3. Homepage/category/message clarity.
4. Accessibility and responsive defects.
5. Brand and prose polish.

Group repeated nav/footer/metadata issues into one finding with affected pages.

## Interactive Fix Loop

For each issue:

1. Show the issue summary, evidence, options, recommendation, and verification plan.
2. Ask the user to choose **Accept**, **Edit**, **Defer**, or **Reject**.
3. On Accept/Edit, apply only the approved change.
4. Record the decision and rationale in `site-review-report.md`.
5. After every batch of up to five accepted edits, rerun the relevant attack passes and re-check affected pages.

If a fix changes visible layout or CSS, verify desktop and mobile. If browser screenshots fail, record the fallback checks used.

## Output

- `site-review-packet.md`: surface map + prioritized adversarial findings.
- Edits to site files only after user approval.
- `site-review-report.md`: final disposition, applied changes, deferred items, canon-update flags, and verification results.

## Postconditions

- Every finding in the packet has a recorded disposition.
- Every accepted edit has been applied and verified.
- All edited pages have been checked with the best available combination of static parsing, local HTTP, and screenshots.
- Any canon-side issues are flagged, not fixed here.

## Constraints

- Agents propose; humans approve.
- Do not auto-apply fixes during packet creation.
- Do not commit unless explicitly requested.
- Canon is read-only during this prompt.
- Do not invent a redesign when a bounded copy, metadata, link, or CSS fix is enough.
- Preserve unrelated user changes.

## Validation Gates

- `git status --short` captured before and after.
- Local link and fragment check across `site/public`.
- Metadata check for title, description, canonical, OG basics, JSON-LD parseability, sitemap coverage, robots, and `llms.txt`.
- Local HTTP check for public pages when a server is available.
- Desktop and mobile visual check for edited pages when browser tooling is available.

## Failure Modes

- **Browser tooling fails.** Fall back to static parsing, local HTTP checks, and source inspection; record the limitation.
- **Claim depends on current external fact.** Verify from primary/current source before treating it as valid.
- **Fix requires canon change.** Flag it for `review-canon.md` and keep site copy conservative.
- **Major redesign requested mid-review.** Pause and propose a separate design pass.

## Anti-Patterns

- Treating the site as a copy of the canon.
- Leaving stale `llms.txt` or sitemap files out of scope.
- Putting broad competitor claims in structured data.
- Fixing only visible HTML while metadata and AI-reader surfaces remain stale.
- Skipping verification after CSS or navigation changes.
