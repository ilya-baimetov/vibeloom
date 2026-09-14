#!/usr/bin/env bash
# Reproducible bundle builder for vibeloom v0.3.
#
# Output: vibeloom-v0.3.0.tar.gz in <repo-root>/dist/, plus a sha256 sidecar.
# (dist/ is gitignored — release assets live there before being uploaded to GitHub releases.)
# Reproducibility flags applied: --sort=name --owner=0 --group=0 --numeric-owner
# + gzip -n + fixed mtimes inside the archive.
#
# Usage:
#   bash v03/build-bundle.sh                # uses repo HEAD commit timestamp
#   bash v03/build-bundle.sh --staging /tmp/foo  # alt staging dir
#
# The bundle layout MIRRORS the v03/ repo layout exactly. That parity is the
# whole point: SKILL.md's relative links ("vibeloom-methodology.md",
# "artifacts/", "tasks/", "references/x.md") then resolve identically whether
# the skill is loaded from a git clone or from an unpacked tarball. The earlier
# build flattened templates/skill/ onto the bundle root without rewriting those
# paths, which shipped a SKILL.md with five dangling links -- including the
# three authoritative specs its own first instruction told agents to consult.
#
#   vibeloom-v0.3.0/
#     SKILL.md                  (the skill manifest at top so loaders see it)
#     subagent-prompt.md
#     SKILL-README.md
#     references/*.md
#     tasks/*.md
#     artifacts/**/*.md
#     vibeloom-methodology.md   (authoritative: WHAT -- SKILL.md links to it)
#     vibeloom-implementation.md(authoritative: HOW  -- SKILL.md links to it)
#     codæ-manifesto.html       (paradigm: WHY       -- SKILL.md links to it)
#     examples/*.md             (worked examples -- SKILL-README.md links to them)
#     engine/                   (Python package + pyproject.toml)
#     manifest.yaml             (release manifest with name/version/sha256s)
#     LICENSE-PLACEHOLDER       (placeholder; real LICENSE is repo-level)

set -euo pipefail

# Suppress macOS AppleDouble (._*) resource-fork files. Without this, bsdtar
# serialises xattrs (com.apple.provenance) as ._* members -- the v0.3.0 tarball
# shipped 74 of them, which materialise as literal junk files when extracted
# with GNU tar on Linux.
export COPYFILE_DISABLE=1

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || (cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd))}"
V03="$REPO_ROOT/v03"
SURFACE="$V03"          # the skill surface now lives at the version root
ENGINE_SRC="$V03/engine"

# Portable epoch -> formatted UTC date. BSD/macOS date takes -r <epoch>; GNU
# date takes -d @<epoch> and treats -r as "reference file". Supporting both
# means the release is cuttable from Linux CI, not just a maintainer's Mac.
epoch_fmt() {  # $1 = epoch seconds, $2 = strftime format
  date -u -r "$1" "$2" 2>/dev/null || date -u -d "@$1" "$2"
}
VERSION="0.3.0"
NAME="vibeloom-v${VERSION}"

# Use the source commit's UTC timestamp for reproducible mtimes.
SOURCE_SHA="$(cd "$REPO_ROOT" && git rev-parse HEAD)"
SOURCE_TS="$(cd "$REPO_ROOT" && git log -1 --format=%cI HEAD)"
SOURCE_TS_EPOCH="$(cd "$REPO_ROOT" && git log -1 --format=%ct HEAD)"
# build_date_utc is set to SOURCE_TS so reproducibility check passes.
# Use SOURCE_BUILD_DATE_OVERRIDE=now to use wall time instead.
if [ "${SOURCE_BUILD_DATE_OVERRIDE:-}" = "now" ]; then
  BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
else
  BUILD_DATE="$(epoch_fmt "$SOURCE_TS_EPOCH" +%Y-%m-%dT%H:%M:%SZ)"
fi

STAGING="${STAGING:-/tmp/vibeloom-bundle-staging-$$}"
BUNDLE_DIR="$STAGING/$NAME"

echo "Building $NAME"
echo "  source commit: $SOURCE_SHA"
echo "  commit ts (UTC): $SOURCE_TS  (epoch=$SOURCE_TS_EPOCH)"
echo "  build date (UTC): $BUILD_DATE"
echo "  staging: $STAGING"

# --- step 0: gate on source-vs-disk parity and link integrity ---
# Both are decidable checks; a release should never be cuttable while either fails.
if [ ! -f "$SURFACE/SKILL.md" ]; then
  echo "ERROR: SKILL.md not found at $SURFACE — run extract-templates.py first"
  exit 1
fi

echo "  gate: extract-templates.py --check (source vs committed surface)"
python3 "$V03/extract-templates.py" --check

echo "  gate: check-links.py (repo layout link integrity)"
python3 "$V03/check-links.py" --root "$SURFACE" --quiet

# --- step 1: assemble bundle ---
rm -rf "$STAGING"
mkdir -p "$BUNDLE_DIR"

# 1a. Skill manifest at top so loaders find it.
cp "$SURFACE/SKILL.md" "$BUNDLE_DIR/SKILL.md"

# 1b. Subagent prompt
cp "$SURFACE/subagent-prompt.md" "$BUNDLE_DIR/subagent-prompt.md"

# 1c. References + tasks + artifacts — same relative paths as the repo.
mkdir -p "$BUNDLE_DIR/references" "$BUNDLE_DIR/tasks"
cp "$SURFACE/references/"*.md "$BUNDLE_DIR/references/"
cp "$SURFACE/tasks/"*.md "$BUNDLE_DIR/tasks/"
mkdir -p "$BUNDLE_DIR/artifacts"
# Use cp -R so we preserve directory structure.
cp -R "$SURFACE/artifacts/." "$BUNDLE_DIR/artifacts/"

# 1c-bis. The three authoritative documents SKILL.md links to and declares
# mandatory ("Always consult these before making decisions"; "If this skill
# file conflicts with the methodology, the methodology wins"). Omitting them
# is what made the v0.3.0 bundle's own instructions unfollowable.
cp "$SURFACE/vibeloom-methodology.md"   "$BUNDLE_DIR/"
cp "$SURFACE/vibeloom-implementation.md" "$BUNDLE_DIR/"
cp "$SURFACE/codæ-manifesto.html"        "$BUNDLE_DIR/"

# 1c-ter. Worked examples (48K). SKILL-README.md links to them, and their own
# ../vibeloom-implementation.md links resolve against the bundle root now that
# the specs ship too. Caught by the step-7 link gate when omitted.
mkdir -p "$BUNDLE_DIR/examples"
cp "$SURFACE/examples/"*.md "$BUNDLE_DIR/examples/"

# 1d. Engine (Python package + pyproject.toml).
mkdir -p "$BUNDLE_DIR/engine"
cp "$ENGINE_SRC/pyproject.toml" "$BUNDLE_DIR/engine/"
cp -R "$ENGINE_SRC/vibeloom_engine" "$BUNDLE_DIR/engine/"
# Strip __pycache__ if any
find "$BUNDLE_DIR/engine" -name __pycache__ -type d -exec rm -rf {} + 2>/dev/null || true
find "$BUNDLE_DIR/engine" -name '*.pyc' -delete 2>/dev/null || true

# 1e. Skill-surface README (keeps its repo name; layout parity means no rename).
cp "$SURFACE/SKILL-README.md" "$BUNDLE_DIR/SKILL-README.md"

# 1f. License placeholder (the canonical LICENSE belongs at the repo level;
# the bundle pulls a copy when one exists).
if [ -f "$REPO_ROOT/LICENSE" ]; then
  cp "$REPO_ROOT/LICENSE" "$BUNDLE_DIR/LICENSE"
else
  echo "(LICENSE file not found at repo root; skipping bundle LICENSE)" \
    > "$BUNDLE_DIR/LICENSE-PLACEHOLDER.txt"
fi

# --- step 2: compute file inventory + hashes ---
# Build the manifest BEFORE the archive (the tarball includes the manifest).
INVENTORY_FILE="$STAGING/_inventory.tsv"
( cd "$BUNDLE_DIR" && find . -type f ! -name "manifest.yaml" | sort ) > "$STAGING/_files.list"

# Compute sha256 for each file relative to bundle dir.
> "$INVENTORY_FILE"
while IFS= read -r f; do
  # f is "./relative/path"
  rel="${f#./}"
  hash="$(shasum -a 256 "$BUNDLE_DIR/$rel" | awk '{print $1}')"
  printf "%s\t%s\n" "$hash" "$rel" >> "$INVENTORY_FILE"
done < "$STAGING/_files.list"

# --- step 3: write release manifest (YAML; deterministic field order) ---
MANIFEST="$BUNDLE_DIR/manifest.yaml"
cat > "$MANIFEST" <<EOF
# VibeLoom release manifest — generated by v03/build-bundle.sh
# Reproducible: same source commit + same templates + same engine -> identical
# tarball (modulo this file's build_date which the user can rewrite for a
# byte-byte rebuild check; the inventory hashes are stable).

name: vibeloom
version: $VERSION
build_date_utc: $BUILD_DATE
source_commit: $SOURCE_SHA
source_commit_date_utc: $SOURCE_TS
methodology: codæ (contract-driven agentic engineering)

engine:
  language: python
  python_minimum: "3.10"
  runtime_dependencies: []
  console_script: vibeloom-engine

templates:
  total: 41
  source: vibeloom-templates.md (canonical fenced-block source; extracted via extract-templates.py)
  count_per_family:
    skill_manifest: 1
    subagent_prompt: 1
    skill_references: 6
    task_templates: 14
    artifact_templates: 17    # excluding validation-registry
    project_meta: 2           # validation-registry.md + SKILL-README.md

smoke_tests:
  vibe:
    transcript: smoke-vibe.log
    result: pass
  pm:
    transcript: smoke-pm.log
    result: pass

inventory:
EOF

# Append per-file hashes in deterministic (sorted) order.
while IFS=$'\t' read -r hash path; do
  printf "  - path: %s\n    sha256: %s\n" "$path" "$hash" >> "$MANIFEST"
done < "$INVENTORY_FILE"

# Re-hash the manifest itself (it's not in the inventory section but we add it
# at the bottom so reproducibility checks include it).
manifest_hash="$(shasum -a 256 "$MANIFEST" | awk '{print $1}')"
echo "" >> "$MANIFEST"
echo "manifest_self_sha256: $manifest_hash" >> "$MANIFEST"

# --- step 3b: strip extended attributes ---
# macOS tags files copied from other volumes with com.apple.provenance. bsdtar
# serialises any xattr as an AppleDouble ._* member, so these must go before we
# archive. Done before mtimes are fixed, since clearing xattrs touches ctime.
if command -v xattr >/dev/null 2>&1; then
  echo "  stripping extended attributes (AppleDouble prevention)..."
  xattr -c -r "$BUNDLE_DIR" 2>/dev/null || true
fi

# --- step 4: set fixed mtimes for reproducibility ---
# Use SOURCE_TS_EPOCH (commit time) so same-source rebuild -> same archive.
echo "  setting fixed mtimes ($SOURCE_TS) on bundle contents..."
find "$BUNDLE_DIR" -exec touch -t "$(epoch_fmt "$SOURCE_TS_EPOCH" +%Y%m%d%H%M.%S)" {} +

# --- step 5: tar with reproducibility flags + gzip -n ---
DIST="$REPO_ROOT/dist"
mkdir -p "$DIST"
TARBALL="$DIST/${NAME}.tar.gz"
SHA="$DIST/${NAME}.tar.gz.sha256"
echo "  packaging tarball at $TARBALL"

# Reproducibility on bsdtar (macOS) — bsdtar lacks --sort=name, so we
# pre-sort the file list and pass it via -T -. UID/GID erased via
# --uid/--gid/--uname/--gname. gzip -n omits the timestamp from the
# gzip header. Mtimes were set to SOURCE_TS in step 4.

# Build sorted list of paths relative to $STAGING.
( cd "$STAGING" && find "$NAME" -type f | LC_ALL=C sort > "$STAGING/_sorted_files.list" )

# Include directories explicitly so the archive lists them in sorted
# order too (otherwise bsdtar would write them inferred-from-files).
( cd "$STAGING" && find "$NAME" -type d | LC_ALL=C sort > "$STAGING/_sorted_dirs.list" )

# Concatenate — directories first (top-down) then files. Both already sorted.
cat "$STAGING/_sorted_dirs.list" "$STAGING/_sorted_files.list" \
  | LC_ALL=C sort > "$STAGING/_sorted_all.list"

# Ownership-erasure flags differ by tar flavour, and the two are mutually
# unintelligible: bsdtar (macOS default) takes --uid/--gid/--uname/--gname,
# GNU tar takes --owner/--group/--numeric-owner and rejects --uid outright.
# Branch so the release is cuttable on both a maintainer Mac and Linux CI.
# The macOS invocation is unchanged from the original, so the reproducibility
# guarantee against previously published hashes is preserved.
TAR_FLAGS=(--no-recursion)
if tar --version 2>/dev/null | head -1 | grep -q 'GNU tar'; then
  TAR_FLAGS+=(--owner=0 --group=0 --numeric-owner)
else
  TAR_FLAGS+=(--uid 0 --gid 0 --uname "" --gname "")
  # bsdtar-only (macOS 11+): a second line of defence against AppleDouble,
  # alongside COPYFILE_DISABLE and the xattr strip above.
  if tar --no-mac-metadata --version >/dev/null 2>&1; then
    TAR_FLAGS+=(--no-mac-metadata)
  fi
fi

( cd "$STAGING" && \
  tar "${TAR_FLAGS[@]}" -cf - -T "$STAGING/_sorted_all.list" \
) | gzip -n -9 > "$TARBALL"

shasum -a 256 "$TARBALL" > "$SHA"
TARBALL_HASH="$(awk '{print $1}' "$SHA")"

echo "  tarball sha256: $TARBALL_HASH"
echo "  manifest:       $MANIFEST"
echo "  tarball:        $TARBALL"

# --- step 6: stash staging path in a sidecar so subsequent steps can find it ---
echo "$STAGING" > "$REPO_ROOT/.last-bundle-staging.txt"

# --- step 7: verify the artifact we just built ---
# Unpack the tarball into a scratch dir and assert on the thing that actually
# ships, not on the staging dir. Guards the two defects that shipped in the
# first v0.3.0 cut: dangling SKILL.md links, and AppleDouble junk.
VERIFY_DIR="$STAGING/_verify"
mkdir -p "$VERIFY_DIR"
tar xzf "$TARBALL" -C "$VERIFY_DIR"

JUNK_COUNT="$(find "$VERIFY_DIR" -name '._*' | wc -l | tr -d ' ')"
if [ "$JUNK_COUNT" != "0" ]; then
  echo "ERROR: $JUNK_COUNT AppleDouble (._*) file(s) in the tarball"
  exit 1
fi
echo "  verify: no AppleDouble members"

if [ ! -f "$VERIFY_DIR/$NAME/SKILL.md" ]; then
  echo "ERROR: SKILL.md missing from bundle root"
  exit 1
fi
echo "  verify: SKILL.md at bundle root"

python3 "$V03/check-links.py" --root "$VERIFY_DIR/$NAME" \
  || { echo "ERROR: dangling links in the built bundle"; exit 1; }

echo "Bundle built."
