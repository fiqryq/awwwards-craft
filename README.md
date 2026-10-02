# awwwards-craft

An [Agent Skill](https://agentskills.io) for building **Awwwards-level websites**: art-directed layouts, GSAP + Lenis scroll choreography, preloaders, menus, page transitions and optional WebGL. It works in Claude Code, Claude.ai and other Agent Skills–compatible harnesses (Codex, Cursor, Copilot, Gemini CLI, OpenCode, Cline…).

- **Default stack:** latest [Astro](https://astro.build) + pure hand-written CSS (no Tailwind), GSAP (ScrollTrigger, SplitText, CustomEase, Flip), Lenis, and Three.js when needed.
- **Curated palettes** (11 pairs taken from award-winning sites) and **[Fontshare](https://www.fontshare.com/pairs) font pairs** (59 pairings, free for commercial use).
- **An opinionated motion language:** a small set of eases, durations and staggers so every site feels finished, plus recipes for 40+ effects.
- **Built-in QA loop:** desktop and mobile screenshots, reduced-motion checks, navigation leak checks and Lighthouse budgets.
- **Adapts** to existing Next.js, Vite, SvelteKit or Nuxt projects.

## Install

### Any harness: `npx skills` (recommended)

```bash
npx skills add fiqryq/awwwards-craft            # project scope, pick agents interactively
npx skills add fiqryq/awwwards-craft -g         # global
npx skills add fiqryq/awwwards-craft -g -a claude-code -a codex -a cursor
```

The [skills CLI](https://github.com/vercel-labs/skills) supports 70+ agents.

### Claude Code: plugin marketplace

```
/plugin marketplace add fiqryq/awwwards-craft
/plugin install awwwards-craft@awwwards-craft
```

Plugin updates arrive through `/plugin`. To install the plain skill instead, use the installer below or `npx skills`.

### Claude.ai / Claude Desktop

Download `awwwards-craft.zip` from [Releases](https://github.com/fiqryq/awwwards-craft/releases), or build it yourself with `./scripts/package.sh`. Then go to **Settings → Capabilities → Skills → Upload skill**.

### Manual install (clone + installer)

```bash
git clone https://github.com/fiqryq/awwwards-craft.git ~/Github/awwwards-craft
cd ~/Github/awwwards-craft
./scripts/install.sh              # detects installed harnesses and symlinks into each
./scripts/install.sh claude codex # or name targets: claude codex cursor opencode copilot gemini agents | all
./scripts/install.sh --copy all   # copy instead of symlink
./scripts/install.sh --project claude   # into ./.claude/skills of the current project
```

Symlinks pick up updates whenever you `git pull`.

| Harness | Global skills directory |
|---|---|
| Claude Code | `~/.claude/skills/` |
| OpenAI Codex | `~/.codex/skills/` (also reads `~/.agents/skills/`) |
| Cursor | `~/.cursor/skills/` |
| OpenCode | `~/.config/opencode/skills/` |
| GitHub Copilot | `~/.copilot/skills/` |
| Gemini CLI | `~/.gemini/skills/` |
| Cline and others | `~/.agents/skills/` |

## Use

Just ask:

> build an award-winning portfolio site for a Jakarta architecture studio

> make my Next.js landing page feel like an Awwwards site of the day — scroll animations, preloader, page transitions

In Claude Code you can also call it directly with `/awwwards-craft` (or `/awwwards-craft:awwwards-craft` when installed as a plugin).

## Repository layout

```
skills/awwwards-craft/          the skill (Agent Skills format)
  SKILL.md                      workflow + non-negotiables
  references/                   design direction, Astro, CSS, motion, sections, effects, transitions, WebGL, QA, other stacks
  assets/snippets/              framework-free ES modules (lifecycle, copy reveal, preloader, menu, transitions, …)
.claude-plugin/                 Claude Code plugin + marketplace manifests
scripts/install.sh              multi-harness installer
scripts/package.sh              builds dist/awwwards-craft.zip
evals/                          test prompts used to iterate on the skill
```

## License

MIT © Fiqry Choerudin
