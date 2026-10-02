---
name: awwwards-craft
description: Build Awwwards-level, award-winning websites — art-directed layouts, GSAP/Lenis scroll choreography, preloaders, menus, page transitions and optional WebGL — defaulting to the latest Astro with strict TypeScript and pure hand-written CSS (no Tailwind). Use whenever the user wants a premium, immersive, animated or "award-winning" site — portfolio, studio, agency, brand, product or landing page — or asks for scroll animations, text reveals, preloaders, page transitions, sticky/pinned sections, cursor/hover effects or a WebGL hero, even if they never say "Awwwards". Also use to upgrade an existing site (Next.js, Vite, SvelteKit) to that level.
license: MIT
compatibility: Works in any agent that can run shell commands and edit files (Node.js 22+ and npm required; network access to install packages and fonts). A browser automation tool (e.g. Chrome DevTools MCP or Playwright) is recommended for the QA step.
metadata:
  author: fiqryq
  version: "1.0.0"
  repository: https://github.com/fiqryq/awwwards-craft
---

# Awwwards Craft

Build sites that could win Site of the Day: one strong concept, editorial typography, a restrained but confident motion language, and flawless execution (no jank, no flashes of unstyled content, works on mobile, respects reduced motion).

The motion and layout numbers in this skill are distilled from a large body of award-style production sites. They are a **house style**, not a cage: use them as defaults so every site feels finished, then bend them for the concept.

## Defaults

| Concern | Default | Why |
|---|---|---|
| Framework | Latest **Astro** (`npm create astro@latest`) | Static-first HTML, zero JS unless asked, built-in view transitions and fonts API. |
| Language | **TypeScript, strict** (`astro/tsconfigs/strictest`), typed component `Props`, typed scripts; `astro check` must report 0 errors | GSAP, Lenis and Astro ship their own types; strict types catch null elements and bad tween vars before the browser does. |
| Styling | **Pure CSS** — global tokens + scoped `<style>` per component. **Never Tailwind** or other utility frameworks. | Award sites are art-directed; hand-written CSS keeps the craft legible and the markup clean. |
| Motion | `gsap` (all plugins are free and in the core package: ScrollTrigger, SplitText, CustomEase, Flip, ScrambleText) + `lenis` | The proven stack for this genre. |
| 3D | `three` only when the brief needs it | WebGL is a cost; it must earn its place. |
| Color | One palette from the **palette library** in `design-direction.md` (11 pairs taken from award-winning sites) | Proven combinations; tokens derive the in-between stops. |
| Fonts | A **Fontshare pair** (fontshare.com/pairs) loaded with the Astro Fonts API (`fontProviders.fontshare()`) | Free for commercial use, self-hosted, preloaded. Never ship fonts you don't have a license for. |

If the user is already in a different framework, keep it and read `references/other-stacks.md` — CSS stays pure there too.

Astro moves fast. Before writing routing/transition code in a new project, skim https://docs.astro.build/en/guides/view-transitions/ and the fonts guide once to confirm API names haven't changed.

## Workflow

Follow these steps in order. Each step names the reference file to load; load it at that step, not before.

### 1. Detect the context
- Empty folder or new site → scaffold Astro (minimal template, **no Tailwind integration**), set `tsconfig.json` to extend `astro/tsconfigs/strictest`, then `npm i gsap lenis` and `npm i -D @astrojs/check typescript`. Read `references/astro-foundation.md`.
- Existing project → identify the framework from `package.json`. Astro → `astro-foundation.md`. Anything else → `other-stacks.md`.

### 2. Write the creative brief (before any code)
Read `references/design-direction.md`. Write the brief to `BRIEF.md` at the project root and show it to the user in a few lines. It fixes: concept in one sentence, mood words, palette (from the library), Fontshare pair, grid, **one signature interaction**, section list, and the preloader / menu / page-transition variants. Choose variants deliberately and differently each time — sameness is the fastest way to look templated.

### 3. Lay the foundation
Read `references/css-system.md` and `references/motion-language.md`. Then:
- `src/styles/global.css`: tokens, reset, type scale, container/grid, utility classes like `.mono`.
- `src/layouts/BaseLayout.astro`: fonts, `<ClientRouter />` (if multi-page), persistent nav/menu, transition overlay.
- `src/scripts/`: copy the needed **TypeScript** modules from `assets/snippets/` (start with `lenis-gsap.ts`, `eases.ts`, `lifecycle.ts`, `copy-reveal.ts`) and adapt them.

### 4. Build the sections
Read `references/layouts-sections.md` for section recipes, then `references/effects-catalog.md` for the effect each section needs. Build static HTML + CSS first and check it looks right with zero JS — that is also the reduced-motion and no-JS experience. Then add motion.

Spend the boldness budget on **one hero-level signature moment** plus a consistent reveal language everywhere else. Animating everything equally reads as noise.

### 5. Preloader, menu, page transitions
Read `references/page-transitions.md`. Preloader plays on first visit only. Menu and transitions use the same easing family as the rest of the site.

### 6. WebGL (only if the brief calls for it)
Read `references/webgl.md`. Always ship a static fallback (image/video) and cap device pixel ratio at 2.

### 7. QA loop — do not skip
Read `references/qa-performance.md`. Run `npx astro check` (0 errors, 0 warnings), build, run, screenshot desktop (1440) and mobile (390), test reduced motion, navigate between pages and confirm no leaked ScrollTriggers, run Lighthouse. Fix and repeat until it passes. A gorgeous site that janks or breaks on mobile does not win.

## Non-negotiables

These are the things that most often separate "nice" from "award-level", and the things AI-built sites most often get wrong:

1. **No flash before JS.** Every element that animates in has its hidden start state in CSS — prefer `clip-path`, `opacity`, `visibility`. If a CSS start state uses `transform: translateY(%)`, the GSAP tween must also set `y: 0` (GSAP reads it as pixels and fights `yPercent`).
2. **Split text only after fonts load** (`await document.fonts.ready`) and always with a `mask`, so lines slide out of a clipping box instead of fading.
3. **Clean up on navigation.** Every ScrollTrigger, SplitText, ticker callback, rAF loop and listener created for a page is reverted on `astro:before-swap`. Use the lifecycle registry in `assets/snippets/lifecycle.ts`.
4. **Respect `prefers-reduced-motion`.** No Lenis, no pins, no scrubbed scenes, no WebGL loops — just short opacity fades and the final layout.
5. **Responsive is designed, not shrunk.** One main breakpoint at `1000px`. Heavy pinned scenes are desktop-only via `gsap.matchMedia()`; mobile gets a simpler, still-beautiful version.
6. **Viewport-relative lengths are functions.** `end: () => "+=" + innerHeight * N` with `invalidateOnRefresh: true`, never a value computed once at load.
7. **Real content density.** Write believable copy, labels, numbers and metadata for the brand — empty lorem sections look like a template.
8. **Persist on the element, not the component.** `transition:persist` goes on the root element *inside* `Nav.astro` / `Menu.astro` / `TransitionOverlay.astro`; on a component tag it silently does nothing.
9. **Typed, not cast.** Query DOM with generics (`querySelector<HTMLElement>(…)`) and handle `null`; type component `Props`; no `any`, no `@ts-ignore`. Extend the snippets' exported types (`PageSetup`, `PageContext`, `PinnedSceneOptions`, …) instead of loosening them.
10. **Semantic, accessible markup.** Real `<nav>`, `<main>`, `<h1>`; menu toggles are `<button>` with `aria-expanded`; `aria-label` from SplitText only on headings (it's prohibited on `<p>`).

## Reference map

| File | Load when |
|---|---|
| `references/design-direction.md` | Step 2 — writing the brief |
| `references/astro-foundation.md` | Step 1/3 — Astro project setup, lifecycle, Lenis/GSAP boot |
| `references/css-system.md` | Step 3 — tokens, type, grid |
| `references/motion-language.md` | Step 3 onward — eases, durations, staggers, scroll conventions |
| `references/layouts-sections.md` | Step 4 — hero, cards, spotlight, marquee, CTA, footer, menu, preloader layouts |
| `references/effects-catalog.md` | Step 4 — recipes for reveals, hovers, pinned scenes, sliders, ASCII, SVG goo |
| `references/page-transitions.md` | Step 5 |
| `references/webgl.md` | Step 6 |
| `references/qa-performance.md` | Step 7 |
| `references/other-stacks.md` | Non-Astro projects |
| `assets/snippets/*` | Framework-free, strictly typed TypeScript modules to copy into `src/scripts/` and adapt |

When testing in a browser: `?reduced` forces reduced motion, `window.__aww` exposes `gsap`, `ScrollTrigger` and `lenis`.

Related skills worth pulling in when available: `better-typography` (type details), `oklch-skill` (palette math), `fixing-motion-performance` and `review-animations` (motion QA), `fixing-accessibility`.
