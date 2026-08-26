#!/usr/bin/env bash
# Verifies the built landing page actually rendered its content.
# Usage: bash scripts/verify-build.sh
set -euo pipefail

OUT="public/index.html"
DATA="src/content/event-data.json"
CONTENT_PAGES_DIR="src/pages/content-pages"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$OUT" ] || fail "$OUT does not exist"
[ -f "$DATA" ] || fail "$DATA does not exist"

# Read the needles straight out of the config this build is supposed to have
# rendered, rather than hardcoding today's copy. That way the check keeps
# proving the config reached the HTML no matter what an organiser edits it to.
for field in city year dateLabel; do
  value=$(node -p "require('./$DATA').$field")
  [ -n "$value" ] || fail "$DATA has no value for '$field'"
  grep -qF "$value" "$OUT" || fail "$OUT is missing literal '$value' ($DATA.$field)"
done

# Derive the dormant-route list from the .md files actually on disk instead of
# a hand-maintained list, so it cannot drift as OCP content pages are added or
# removed.
for md in "$CONTENT_PAGES_DIR"/*.md; do
  dormant=$(basename "$md" .md)
  if [ -d "public/$dormant" ]; then
    fail "public/$dormant/ exists — dormant OCP page produced a route"
  fi
done

echo "PASS: build output verified"
