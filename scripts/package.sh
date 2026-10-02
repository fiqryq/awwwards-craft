#!/usr/bin/env bash
# Build dist/awwwards-craft.zip for upload to Claude.ai / Claude Desktop
# (Settings → Capabilities → Skills → Upload) or any harness that accepts a zipped skill folder.
set -euo pipefail
NAME="awwwards-craft"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$REPO_DIR/dist"
OUT="$REPO_DIR/dist/$NAME.zip"
rm -f "$OUT"
cd "$REPO_DIR/skills"
zip -rq "$OUT" "$NAME" -x "*.DS_Store"
echo "✔ $OUT"
unzip -l "$OUT" | tail -1
