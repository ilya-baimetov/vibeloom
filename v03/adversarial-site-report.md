# VibeLoom v03 Adversarial Marketing Site Review

Scope: `v03/site/public/`, including HTML, CSS, sitemap, robots, and `llms.txt`.

Review posture: adversarial. This report focuses on message quality, concision, credibility, static correctness, and whether the site accurately reflects the v03 canon.

## Executive Summary

The site has a sharper product position than earlier versions: "contract-driven agentic engineering" is visible, the homepage has real structure, and the comparison against spec-driven tools gives the reader a reason to care. The biggest weaknesses are drift and overclaiming. The site exposes duplicate manifesto URLs, has stale `llms.txt` content from v0.2, contains broken local links, and repeats competitor claims in places where they are brittle, including JSON-LD.

The recommended direction is to make the site more focused and less fragile:

- One canonical manifesto URL.
- One static validation script for links, fragments, metadata, and `llms.txt`.
- Fewer top-of-page stats and softer competitor claims.
- Exact alignment with v03 canon language and runtime behavior.

## SITE-01: `llms.txt` is stale and contradicts v03

Severity: Critical

Evidence:

- `llms.txt` says v0.2 ships the methodology, site, and seed skill.
- It describes four modes instead of the current mode set.
- It references old concepts such as approved-state snapshots, context graph, and `.vibeloom/state/context-graph.json`.

Why this is an issue:

`llms.txt` is specifically for AI readers. If it contains v0.2 terms, AI agents and search systems will learn the wrong product model. This is worse than a normal stale page because the file is intended to be a compact source of truth.

Fix options:

1. Rewrite `llms.txt` from v03 canon.
   This directly fixes the public AI-facing summary.

2. Generate `llms.txt` from a short canonical source file.
   This reduces future drift but adds tooling.

3. Remove `llms.txt` until it can be maintained.
   This avoids misinformation but wastes an important distribution surface.

Recommended fix:

Use option 1 now and add option 2 later. The current file should not stay public in its v0.2 shape.

## SITE-02: The site exposes duplicate manifesto pages

Severity: High

Evidence:

- The site contains both `codae.html` and `codæ-manifesto.html`.
- The sitemap includes both `/codae` and `/cod%C3%A6-manifesto`.
- Navigation points to `codae.html`, while the longer manifesto page remains public.
- Neither page declares a canonical URL.

Why this is an issue:

This creates duplicate content, SEO ambiguity, and a maintenance fork. The two versions can drift in claims, structure, and links. The reader also cannot tell which manifesto is current.

Fix options:

1. Make `/codae` the single public manifesto URL and remove the second page from the sitemap.
   This is the cleanest site model.

2. Keep the long page as a whitepaper but add canonical/noindex behavior and clear labeling.
   This preserves depth without confusing search or visitors.

3. Redirect `/cod%C3%A6-manifesto` to `/codae`.
   This is operationally clean if redirects are supported by the hosting setup.

Recommended fix:

Use option 1 if the short manifesto is the intended public page. If the full manifesto must remain public, use option 2 and make `/codae` canonical.

## SITE-03: Local links and fragments are broken

Severity: High

Evidence:

- `codæ-manifesto.html` links to `vibeloom-methodology.md`, which is not present in `v03/site/public/`.
- `get-started.html` links to `codae.html#case`, but `codae.html` has no `case` fragment.

Why this is an issue:

Broken links are trust defects. They also matter more here because VibeLoom is selling a methodology and source-of-truth discipline. A site about contract integrity should not ship obvious broken contract links.

Fix options:

1. Point site pages to site HTML pages such as `methodology.html`.
   This optimizes visitor flow.

2. Point source/documentation links to GitHub canonical markdown URLs.
   This preserves source access and avoids copying markdown into the site.

3. Publish the canon markdown files into the static site.
   This makes local links valid but duplicates another content surface.

Recommended fix:

Use options 1 and 2 by intent: visitor-facing links go to HTML pages; "source" links go to GitHub. Do not publish extra markdown into the static site unless the site generator owns it.

## SITE-04: Competitor claims are too broad and appear in brittle surfaces

Severity: High

Evidence:

- Homepage and FAQ copy say other tools generate specs that decay or stop before implementation.
- JSON-LD FAQ includes claims that competitors pivoted, stop short, or leave glue to the user.
- The comparison matrix makes strong product-category claims about GitHub Spec Kit, Kiro, and Tessl.

Why this is an issue:

The positioning is useful, but broad claims can read as defensive or unfair if they are not heavily sourced. Putting this language in structured data is especially risky because it is intended for search engines and AI systems, not just human readers.

Fix options:

1. Soften claims to VibeLoom's positive distinction.
   For example: "VibeLoom keeps the contract connected through implementation" instead of "others stop short."

2. Keep direct comparison but add dated citations and narrower wording.
   This preserves competitive punch while reducing credibility risk.

3. Move detailed comparisons to a separate evidence page and keep the homepage concise.
   This reduces homepage friction and lets interested readers inspect sources.

Recommended fix:

Use option 1 for homepage and JSON-LD, and option 2 or 3 for deeper comparison sections. Structured data should be conservative.

## SITE-05: The homepage leans too heavily on dated evidence stats

Severity: Medium

Evidence:

- The top sections include several 2026 statistics and "verified 2026 evidence" framing.
- Similar evidence appears in the manifesto and methodology-adjacent pages.

Why this is an issue:

Proof is valuable, but too many dated stats near the top can make the site feel like a research memo instead of a product narrative. Dated claims also require maintenance. If one claim goes stale, it damages the rest.

Fix options:

1. Keep one strongest proof point above the fold and move the rest lower.
   This preserves credibility while improving concision.

2. Create a compact evidence page or appendix.
   This lets the homepage stay sharp without losing substantiation.

3. Remove dated stats from the homepage entirely.
   This is clean but may make the category argument feel less grounded.

Recommended fix:

Use option 1 now and consider option 2 when the evidence set grows. The homepage should sell the thesis first, then prove it.

## SITE-06: The animated hero word cycle weakens the core phrase

Severity: Medium

Evidence:

- The hero renders "Spec-driven agentic engineering" as one cycle state even though the core product category is "contract-driven agentic engineering."
- The static accessibility label still says contract-driven, which creates a slight visible/accessibility mismatch.

Why this is an issue:

The homepage first screen should train one phrase. Cycling through adjacent terms dilutes the positioning and risks making "contract" feel interchangeable with "spec."

Fix options:

1. Use a static H1: "Contract-driven agentic engineering."
   This is the strongest brand/category move.

2. Keep animation but cycle only supporting nouns outside the category phrase.
   This keeps motion without weakening the category.

3. Move the cycle lower on the page.
   This keeps the playful element but protects first-screen clarity.

Recommended fix:

Use option 1. The category phrase is still new; it needs repetition, not variation.

## SITE-07: The short and long manifesto pages can drift in claims

Severity: Medium

Evidence:

- `codae.html` is a shortened public essay.
- `codæ-manifesto.html` is a longer full manifesto copy.
- They differ in structure and claim density.

Why this is an issue:

Even if duplicate URLs are fixed, maintaining two authored manifesto versions invites drift. The public site should not force maintainers to update the same thesis in two places.

Fix options:

1. Keep the short site essay and make the full manifesto source-only.
   This makes the site concise and keeps the canon elsewhere.

2. Generate the short page from selected sections of the full manifesto.
   This reduces drift but requires build tooling.

3. Keep both, but add a visible "short version" and "full version" relationship.
   This is acceptable if both must remain public.

Recommended fix:

Use option 1 for now. Let `/codae` be the public page and link to the canonical source document for the full version.

## SITE-08: The implementation page over-specifies runtime behavior and drifts from canon

Severity: Medium

Evidence:

- The implementation page says validators run inside a subagent's staging directory before patches reach the working tree.
- The implementation canon describes orchestrator/staging/validation/atomic-apply behavior more precisely.
- The quickstart language can make vibe-mode system-spec approvals sound like formal full-mode approvals.

Why this is an issue:

The marketing site should explain the model, not become a second runtime spec. Runtime details on the site will drift unless they are generated from canon.

Fix options:

1. Rewrite implementation-page runtime copy as high-level narrative and link to the implementation spec for exact mechanics.
   This reduces drift and improves concision.

2. Copy the exact canon wording into the page.
   This fixes accuracy but increases maintenance duplication.

3. Add a generated implementation excerpt from the canon.
   This is robust but requires tooling.

Recommended fix:

Use option 1. The site should explain why the runtime matters and what guarantees it gives, not duplicate the operational spec.

## SITE-09: Visible brand copy is not fully standardized

Severity: Low

Evidence:

- The homepage uses "contract-driven agentic engineering."
- Footer and some supporting copy still use "contract-driven development for AI-coded projects."

Why this is an issue:

The older phrase is not wrong, but the site needs one visible category phrase. Mixed phrases slow down comprehension and weaken recall.

Fix options:

1. Standardize all visible primary copy to "contract-driven agentic engineering."
   This maximizes consistency.

2. Keep SEO variants in metadata only.
   This allows search coverage without diluting visible positioning.

3. Add a glossary that maps old terms to the new phrase.
   This is unnecessary unless old terminology must remain public.

Recommended fix:

Use options 1 and 2. Visible page copy should converge; metadata can carry synonyms.

## SITE-10: The site lacks a regression gate for static integrity

Severity: Medium

Evidence:

- A static local check found missing local links.
- Duplicate pages and stale metadata were present.
- The site is hand-authored HTML/CSS without an obvious generated validation pass.

Why this is an issue:

Manual static sites are easy to drift. This project needs a small integrity check because many claims, links, and canon references are cross-page.

Fix options:

1. Add a small script that checks local links, fragments, canonical tags, sitemap coverage, `llms.txt` freshness markers, and duplicate titles.
   This is low cost and catches current failures.

2. Move the site to a static generator with shared partials and generated sitemap.
   This is more maintainable but larger work.

3. Keep manual editing but add a review checklist.
   This helps, but it will miss machine-detectable defects.

Recommended fix:

Use option 1 first. A lightweight validation script gives immediate protection without changing the site architecture.

## Recommended Fix Order

1. Rewrite `llms.txt`.
2. Resolve the manifesto URL/canonical model.
3. Fix broken links and fragments.
4. Tighten homepage claims and JSON-LD.
5. Standardize the hero/category phrase and footer copy.
6. Add a static site validation script.

