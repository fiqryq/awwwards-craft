# Page transitions, preloader & menu wiring (Astro)

Four transition families. Pick one per site in the brief. All of them must: keep nav/menu persistent, reset scroll to top, revert the old page's animations, refresh ScrollTrigger on the new page, and do nothing fancy under reduced motion.

## Astro events you will use

| Event | When | Use |
|---|---|---|
| `astro:before-preparation` | link clicked, before fetching | start the cover animation; wrap `event.loader` so the swap waits for it; close the menu |
| `astro:after-preparation` | new page fetched | hide loading indicators |
| `astro:before-swap` | old page still visible, about to swap | **revert old page animations** (`lifecycle.js` does this) |
| `astro:after-swap` | new DOM in place | scroll to top, re-add `js-motion` class, `lenis.resize()` |
| `astro:page-load` | new page visible, scripts run | init new page (`onPage`), uncover, `ScrollTrigger.refresh()` |

---

## Family 1 — CSS view transitions (ClientRouter)

The browser snapshots old and new pages; you animate `::view-transition-old/new`. Cheapest and smooth. Good default.

```astro
---
// BaseLayout.astro frontmatter
const pageClip = {
  forwards: {
    old: { name: "page-out", duration: "1.5s", easing: "cubic-bezier(0.87,0,0.13,1)", fillMode: "forwards" },
    new: { name: "page-in",  duration: "1.5s", easing: "cubic-bezier(0.87,0,0.13,1)", fillMode: "both" },
  },
  backwards: {
    old: { name: "page-out", duration: "1.5s", easing: "cubic-bezier(0.87,0,0.13,1)", fillMode: "forwards" },
    new: { name: "page-in",  duration: "1.5s", easing: "cubic-bezier(0.87,0,0.13,1)", fillMode: "both" },
  },
};
---
<html lang="en" transition:animate={pageClip}>
```

```css
/* global.css */
@keyframes page-out {
  to { opacity: 0.2; transform: translateY(-35%); }
}
@keyframes page-in {
  from { clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%); transform: translateY(25%); }
  to   { clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%);     transform: translateY(0%); }
}
```

Variants (swap the keyframes):
- **Shrink & slide**: old → `scale(0.5)` + fade; new → `clip-path: circle(0% → 75% at 50% 50%)`.
- **Rotate away**: old → `translateX(-30%) rotate(-6deg) scale(0.8)`; new enters from right through a clip that opens from the right edge.
- **Clip from center-bottom**: new → `polygon(50% 100%, 50% 100%, 50% 100%, 50% 100%)` → full.

Persistent nav: give it `transition:persist` **and** `transition:animate="none"` so it stays still above the pages. Astro skips these animations automatically under reduced motion.

## Family 2 — GSAP cover overlay (ClientRouter)

A persistent overlay (block grid, strips, SVG strokes, solid panel) covers the screen, the swap happens underneath, then it uncovers. Most "agency" feel. Use `assets/snippets/transition-cover.js`.

```astro
<!-- TransitionOverlay.astro -->
<div class="transition" aria-hidden="true" transition:persist="transition-overlay" transition:animate="none">
  {Array.from({ length: 10 }, () => <div class="block" />)}
</div>
<style>
  .transition { position: fixed; inset: 0; z-index: 1000; pointer-events: none;
    display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(2, 1fr); }
  .block { background: var(--base-500); transform: scaleY(0); transform-origin: top; }
</style>
```

Core wiring (the snippet implements this with reduced-motion and back/forward handling):

```js
let covered = false;
document.addEventListener("astro:before-preparation", (e) => {
  if (reducedMotion) return;
  const originalLoader = e.loader;
  e.loader = async () => {
    await Promise.all([cover(), originalLoader()]);   // fetch while covering
    covered = true;
  };
});
document.addEventListener("astro:page-load", () => {
  if (!covered) return;
  covered = false;
  uncover();
});

function cover() {
  return gsap.to(".transition .block", {
    scaleY: 1, transformOrigin: "top", duration: 1, ease: "power4.inOut",
    stagger: { each: 0.1, grid: [2, 5], axis: "x", from: "start" },
  }).then();
}
function uncover() {
  return gsap.to(".transition .block", {
    scaleY: 0, transformOrigin: "bottom", duration: 1, ease: "power4.inOut",
    stagger: { each: 0.1, grid: [2, 5], axis: "x", from: "start" },
  });
}
```

Requirements: `<html transition:animate="none">` (so Astro's crossfade doesn't fight the overlay), `transition:persist` on the overlay's **root element inside the component** (not on the `<TransitionOverlay />` tag — that emits nothing), query the overlay at call time, `pointer-events: all` while covered.

Cover variants:
- **Strips**: 1 row × 5–8 columns `scaleX` with `hop`, stagger ±0.075 alternating origin per row.
- **Shutter grid**: 4 × 16 blocks, rows alternate `transformOrigin` left/right and stagger `from` start/end (0.6s `power3.inOut`, each 0.025).
- **Rows + brand word**: 4 full-width rows `scaleX 0→1` from left (1s `hop`, stagger 0.075), a masked brand word slides in; uncover to the right.
- **Block flicker**: shuffled tiles toggle `opacity` (0.075s, `repeat: 1, yoyo`, delay `i * 0.025`).
- **SVG scribble**: two huge paths draw in (`strokeDashoffset → 0`, stroke-width 200 → 700, 1s `power1.inOut`) and draw out to `-length`. SVG `preserveAspectRatio="none"`, wrapper `scale(1.5)`.
- **Path morph**: overlay path hidden → bulge → full (see effects-catalog §7), reverse to uncover.
- **Scale-from-center panel**: overlay `scale 0 → 1.05`, stagger from center for multi-panel.

## Family 3 — Native cross-document view transitions (no ClientRouter, zero JS)

For lighter sites. Each page is a real navigation; scripts naturally re-run; no cleanup needed.

```css
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: 1.2s var(--ease-vt) both page-out; }
::view-transition-new(root) { animation: 1.2s var(--ease-vt) both page-in; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
}
```

Give the nav `view-transition-name: nav` and `::view-transition-group(nav) { animation: none; z-index: 100; }`. Supported in Chromium and Safari; other browsers simply navigate normally — acceptable progressive enhancement.

## Family 4 — Vanilla MPA handoff (rarely needed with Astro)

Intercept clicks → animate cover → set `sessionStorage.transition = "1"` → `location.href = url`. On the next page, an inline `<head>` script adds a class that paints the cover before first render, then the page animates it out. Only use if ClientRouter is unwanted but a GSAP cover is required.

---

## Preloader wiring

- Render the preloader in BaseLayout, hidden by default in CSS; shown only when `html.js-motion` and not `sessionStorage.seen`.
- An inline head script sets `html.classList.add("first-visit")` when `!sessionStorage.getItem("seen")`; CSS shows the preloader only under `.js-motion.first-visit`.
- `assets/snippets/preloader.js` runs the score once, sets `seen`, removes the node, then dispatches `document.dispatchEvent(new CustomEvent("preloader:done"))` so the hero entrance can start (or the hero entrance is part of the preloader timeline).
- On client navigations the preloader never appears (ClientRouter doesn't re-run its module and the node is gone).
- The hero entrance on later navigations runs immediately with a short delay (~0.3s, after the uncover starts).

## Menu wiring

- Persist the menu (`transition:persist`), so its listeners from `menu.js` survive navigation.
- If a link inside the open menu is clicked, let the cover close over the menu and reset the menu on `astro:after-swap` (resetting on `before-preparation` flashes the faded page).
- `lenis.stop()` while open; Escape closes; focus trap; toggle `aria-expanded`; `inert` on `<main>` while open.

## Checklist

- [ ] Navigate A → B → A → B: no duplicated animations, `ScrollTrigger.getAll().length` stays stable.
- [ ] Back/forward buttons work and still uncover.
- [ ] Scroll position starts at top on new pages.
- [ ] Menu closes on navigation.
- [ ] Reduced motion: instant swaps, no cover.
- [ ] Hash links / external links / `target="_blank"` / modifier-click are not intercepted (ClientRouter handles this; custom MPA handoff must check `e.metaKey || e.ctrlKey || e.shiftKey`).
