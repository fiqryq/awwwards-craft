#!/usr/bin/env bash
# Install the awwwards-craft skill into one or more agent harnesses.
#
#   ./scripts/install.sh                 # interactive: detects installed harnesses
#   ./scripts/install.sh claude codex    # specific targets
#   ./scripts/install.sh all             # every target below
#   ./scripts/install.sh --copy cursor   # copy instead of symlink (no live updates from this clone)
#   ./scripts/install.sh --project claude  # into ./.claude/skills of the current directory
#
# Targets (global paths):
#   claude    ~/.claude/skills            Claude Code
#   codex     ~/.codex/skills             OpenAI Codex CLI
#   cursor    ~/.cursor/skills            Cursor
#   opencode  ~/.config/opencode/skills   OpenCode
#   copilot   ~/.copilot/skills           GitHub Copilot
#   gemini    ~/.gemini/skills            Gemini CLI
#   agents    ~/.agents/skills            Shared Agent Skills dir (Cline, Codex and others read it)
# For other harnesses use: npx skills add fiqryq/awwwards-craft
set -euo pipefail

NAME="awwwards-craft"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_DIR/skills/$NAME"
MODE="link"
SCOPE="global"
TARGETS=()

global_dir() {
  case "$1" in
    claude)   echo "$HOME/.claude/skills" ;;
    codex)    echo "$HOME/.codex/skills" ;;
    cursor)   echo "$HOME/.cursor/skills" ;;
    opencode) echo "$HOME/.config/opencode/skills" ;;
    copilot)  echo "$HOME/.copilot/skills" ;;
    gemini)   echo "$HOME/.gemini/skills" ;;
    agents)   echo "$HOME/.agents/skills" ;;
    *) return 1 ;;
  esac
}

project_dir() {
  case "$1" in
    claude) echo "$PWD/.claude/skills" ;;
    gemini) echo "$PWD/.gemini/skills" ;;
    *)      echo "$PWD/.agents/skills" ;;   # codex, cursor, opencode, copilot, agents
  esac
}

ALL=(claude codex cursor opencode copilot gemini agents)

for arg in "$@"; do
  case "$arg" in
    --copy) MODE="copy" ;;
    --project) SCOPE="project" ;;
    -h|--help) sed -n '2,22p' "$0"; exit 0 ;;
    all) TARGETS=("${ALL[@]}") ;;
    *) global_dir "$arg" >/dev/null || { echo "Unknown target: $arg" >&2; exit 1; }; TARGETS+=("$arg") ;;
  esac
done

[[ -f "$SRC/SKILL.md" ]] || { echo "SKILL.md not found at $SRC" >&2; exit 1; }

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  # detect harnesses by their config dirs
  for t in "${ALL[@]}"; do
    base="$(dirname "$(global_dir "$t")")"
    [[ -d "$base" ]] && TARGETS+=("$t")
  done
  [[ ${#TARGETS[@]} -gt 0 ]] || TARGETS=(agents)
  echo "Detected: ${TARGETS[*]}"
fi

for t in "${TARGETS[@]}"; do
  if [[ "$SCOPE" == "project" ]]; then dir="$(project_dir "$t")"; else dir="$(global_dir "$t")"; fi
  dest="$dir/$NAME"
  mkdir -p "$dir"
  if [[ -L "$dest" ]]; then
    rm "$dest"
  elif [[ -e "$dest" ]]; then
    echo "skip $t: $dest exists and is not a symlink (remove it first)"; continue
  fi
  if [[ "$MODE" == "copy" ]]; then
    cp -R "$SRC" "$dest"
  else
    ln -s "$SRC" "$dest"
  fi
  echo "✔ $t → $dest ($MODE)"
done
