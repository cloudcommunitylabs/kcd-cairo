#!/usr/bin/env bash
# Verifies the built landing page actually rendered its content.
# Usage: bash scripts/verify-build.sh
set -euo pipefail

OUT="public/index.html"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$OUT" ] || fail "$OUT does not exist"

for needle in "Cairo" "2027" "Date to be announced"; do
  grep -qF "$needle" "$OUT" || fail "$OUT is missing literal '$needle'"
done

for dormant in registration travel faq contact help; do
  if [ -d "public/$dormant" ]; then
    fail "public/$dormant/ exists — dormant OCP page produced a route"
  fi
done

echo "PASS: build output verified"
