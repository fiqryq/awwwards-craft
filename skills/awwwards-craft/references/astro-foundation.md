# Astro foundation

Verified against Astro 7 docs (view transitions + fonts). If the installed major version is newer, re-check https://docs.astro.build/en/guides/view-transitions/ before relying on event names.

## Scaffold

```bash
npm create astro@latest my-site -- --template minimal --install --no-git --skip-houston
cd my-site
npm i gsap lenis
npm i -D @astrojs/check typescript
# only if the brief needs WebGL:
npm i three && npm i -D @types/three
```

Use the strictest TypeScript preset (the minimal template ships `strict`):

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strictest",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Add a check script and keep it at **0 errors, 0 warnings**:

```json
// package.json
"scripts": { "check": "astro check", "build": "astro check && astro build" }
```

Do **not** run `astro add tailwind`. Delete any Tailwind config if a template brought one in.

## File structure

```
src/
  assets/              # images processed by <Image />
  components/
    Nav.astro  Menu.astro  Preloader.astro  TransitionOverlay.astro
    Copy.astro         # optional wrapper that adds data-copy attributes
    sections/Hero.astro  Work.astro  Spotlight.astro  Footer.astro ...
  layouts/BaseLayout.astro
  pages/index.astro  work.astro  about.astro  contact.astro  work/[slug].astro
  scripts/             # copied & adapted from the skill's assets/snippets/
    lenis-gsap.ts  eases.ts  lifecycle.ts  copy-reveal.ts  preloader.ts  menu.ts  transition-cover.ts ...
  styles/global.css
astro.config.mjs
BRIEF.md
```

Each component types its props and owns its markup and a scoped `<style>`:

```astro
---
interface Props {
  title: string;
  eyebrow?: string;
  tone?: "paper" | "ink";
}
const { title, eyebrow, tone = "paper" } = Astro.props;
---
<section class:list={["feature", tone]} data-feature>…</section>
```

`<script>` tags in `.astro` files are TypeScript by default — import the snippets without extensions (`import { onPage } from "../scripts/lifecycle"`) and type DOM queries with generics (`root.querySelector<HTMLElement>(".dot")`), handling `null`. Shared data (projects, pricing, curves) lives in typed modules (`src/data/projects.ts` with an exported interface) or content collections with a Zod schema.

Each component owns its markup and a scoped `<style>`; shared tokens and utilities live in `global.css`. Section-specific animation code lives in a `<script>` inside that section's component (Astro bundles it as a module and loads it once).

## Fonts (stable Fonts API + Fontshare)

Use the Fontshare pair chosen in the brief (see `design-direction.md`).

```js
// astro.config.mjs — example pair: Clash Display Semibold + Archivo Regular
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    { provider: fontProviders.fontshare(), name: "Clash Display", cssVariable: "--font-display", weights: [600] },
    { provider: fontProviders.fontshare(), name: "Archivo", cssVariable: "--font-body", weights: [400, 500] },
    // optional technical labels:
    // { provider: fontProviders.google(), name: "JetBrains Mono", cssVariable: "--font-mono", weights: [400] },
  ],
});
```

```astro
---
import { Font } from "astro:assets";
---
<Font cssVariable="--font-display" preload />
<Font cssVariable="--font-body" preload />
```

Font names must match Fontshare's family names exactly ("General Sans", "Cabinet Grotesk", "Pilcrow Rounded"). If a family is missing from the provider, download it from fontshare.com into `src/assets/fonts/` and use `fontProviders.local()`. Confirm option names (`weights`, `styles`) in the fonts guide if the build complains.

## BaseLayout

```astro
---
import { ClientRouter } from "astro:transitions";
import { Font } from "astro:assets";
import Nav from "../components/Nav.astro";
import Menu from "../components/Menu.astro";
import TransitionOverlay from "../components/TransitionOverlay.astro";
import Preloader from "../components/Preloader.astro";
import "../styles/global.css";

const { title, description = "" } = Astro.props;
---
<!doctype html>
<html lang="en" transition:animate="none">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <Font cssVariable="--font-display" preload />
    <Font cssVariable="--font-body" preload />
    <script is:inline>
      // before paint: motion flag (+ ?reduced test switch) and first-visit flag for the preloader
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("reduced");
      if (!reduce) document.documentElement.classList.add("js-motion");
      if (!sessionStorage.getItem("seen")) document.documentElement.classList.add("first-visit");
      history.scrollRestoration = "manual"; // Lenis + pins must start from a known scroll position
    </script>
    <ClientRouter />
  </head>
  <body>
    <Preloader />
    <Nav />
    <Menu />
    <TransitionOverlay />
    <main class="page"><slot /></main>
    <script>
      import "../scripts/lenis-gsap";
      import "../scripts/transition-cover";
    </script>
  </body>
</html>
```

- `transition:animate="none"` on `<html>` disables Astro's default crossfade so a GSAP cover transition owns the moment. If you use a **CSS view-transition** design instead, remove it and define the animation (see `page-transitions.md`).
- **Persist nav, menu and overlay by putting `transition:persist` on each component's ROOT ELEMENT** (inside `Nav.astro`: `<header class="nav" transition:persist="nav">`). On a plain `.astro` component tag the directive emits nothing, so the element is silently replaced on every swap — menus stop working and cover overlays animate detached nodes. Persisted elements should also get `transition:animate="none"`.
- Scripts for persisted components run once and may cache their elements; scripts for swapped content must query at call time or live inside `onPage()`.
- Single-page sites: drop `<ClientRouter />`; everything still works because `lifecycle.ts` also runs on first load.

## Script lifecycle under ClientRouter

Facts from the docs that shape everything:

- Bundled `<script>` modules execute **once**, the first time a page containing them loads. They do not re-run on later navigations.
- Events fire on `document` in this order per navigation: `astro:before-preparation` (has `event.loader`) → `astro:after-preparation` → `astro:before-swap` (old page still visible; `event.newDocument`) → `astro:after-swap` → `astro:page-load` (new page visible).
- `astro:page-load` also fires on the initial page load.
- With `prefers-reduced-motion`, Astro skips its own transition animations automatically.

So: **module code registers; page code runs inside `onPage()`** from `assets/snippets/lifecycle.ts`:

```js
// inside src/components/sections/Spotlight.astro <script>
import { gsap, ScrollTrigger } from "../../scripts/lenis-gsap";
import { onPage } from "../../scripts/lifecycle";

onPage<HTMLElement>(".spotlight", (root, { mm, reduced }) => {
  if (reduced) return;                       // static layout is the reduced-motion version
  mm.add("(min-width: 1000px)", () => {
    ScrollTrigger.create({
      trigger: root, start: "top top",
      end: () => "+=" + innerHeight * 5,
      pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: (self) => { /* map self.progress → gsap.set(...) */ },
    });
  });
  // return a function for anything GSAP doesn't own (listeners, rAF, observers)
  return () => {};
});
```

Give section roots **unique** class names or data attributes (`[data-scene="sun-path"]`) — `onPage` uses `querySelector`, so a generic `.sun` can match a nav icon first.

`onPage` only runs when the selector exists on the current page, wraps the setup in `gsap.context` + `gsap.matchMedia`, and reverts everything on `astro:before-swap`. That is what prevents duplicated triggers, stuck pins and memory leaks after a few navigations.

## Lenis + GSAP boot (once)

`assets/snippets/lenis-gsap.ts` does:

1. `gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip)` once and registers the house eases.
2. Creates **one** Lenis instance (skipped under reduced motion) with `autoRaf: false`, drives it from `gsap.ticker`, sets `lagSmoothing(0)`, and forwards `lenis.on("scroll", ScrollTrigger.update)`.
3. On `astro:after-swap`: `lenis.scrollTo(0, { immediate: true })` and `lenis.resize()` — unless the URL has a hash, then scroll to that element after `astro:page-load` (`lenis.scrollTo(el, { immediate: true })`).
4. On `astro:page-load`: `ScrollTrigger.refresh()` after fonts are ready.
5. Exports `gsap`, `ScrollTrigger`, `SplitText`, `Flip`, `lenis`, `reducedMotion` so every other module imports from one place.

Lenis options that feel right for this genre:

```js
const desktop = { duration: 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), lerp: 0.1, touchMultiplier: 2 };
const mobile  = { duration: 0.8, lerp: 0.09, syncTouch: true, touchMultiplier: 1.5 };
```

Stop Lenis (`lenis.stop()`) while a preloader or menu is open; `lenis.start()` after.

## Images

Use `<Image />` / `<Picture />` from `astro:assets` for anything in `src/assets/` (automatic sizes, formats, lazy loading). Give every image explicit `width`/`height` or an aspect-ratio box so pinned scenes measure correctly. Hero/LCP images: `loading="eager"` + `fetchpriority="high"`.

When the brief needs imagery and none is supplied, use high-quality placeholders sized to the real aspect ratios (e.g. Unsplash source URLs or neutral generated gradients) and list them in `BRIEF.md` so the user can swap them.

## Multi-page data

For work/case-study pages, use a content collection or a typed array in `src/data/projects.ts` and `getStaticPaths()` for `work/[slug].astro`. Keep copy realistic.
