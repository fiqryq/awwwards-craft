# Layouts & section recipes

Recipes for the sections that make up most award-style sites. Each lists structure, CSS essentials and motion. Build static first; motion second. Mix and reorder per the brief.

Typical homepage order: **Preloader → Hero → Intro/About statement → Featured work (pinned/stacked) → Services/Process → Spotlight (pinned scene) → Testimonials/Clients → CTA → Footer.**

---

## Hero

**Structure**
```html
<section class="hero full">
  <div class="hero-media"><img … /></div>
  <div class="hero-copy container">
    <h1 data-copy="chars">Brand<br/>Statement</h1>
  </div>
  <div class="section-footer">
    <p class="mono">[ Studio — Jakarta ]</p>
    <p class="mono">Scroll</p>
    <p class="mono">Est. 2014</p>
  </div>
</section>
```

**Variants**
- **Full-bleed image + overlaid type**: `.hero-media` absolute `inset:0`, dark overlay via `::after` gradient, `h1` bottom-left.
- **Giant headline + inset image**: headline spans the container; a small 4:5 image sits in a grid cell; image scales 1.5→1 on load.
- **Collapse grid**: 3–5 images in a row; outer ones spread off-screen and the center one grows to full viewport (`glide`, ~1.25s).
- **Frame expands**: a small video frame centered; on preloader exit it becomes `position:fixed` at its rect and tweens to `inset:0` full viewport.
- **Type-only**: oversized display type + section footer + a live clock; dramatic but cheap.
- **Height 135svh hero** with stat cards anchored at the bottom when the brand has numbers to show.

**Motion**: hero entrance is driven by the preloader's end (see below). On scroll: hero media parallax `yPercent: 25` and copy fades/translates out (`scrub`).

---

## Intro statement

A large paragraph (`p.lg` or `h3`, 60–70% container width) with a first-line indent made from an inline spacer (`<span class="indent" aria-hidden="true"></span>`, `display:inline-block; width:20%` — **not** `text-indent`, which breaks split text) and a label column.

**Motion**: `data-copy="lines"` reveal at `top 80%`, or **char color fill** (unlit chars must still meet 3:1 against the background — keep the "unlit" color close enough to the ink, or accept it only for display-size text) while scrolling (`start: "top 75%", end: "bottom 30%"`, chars switch from `--muted` to `--fg` as `floor(progress * n)` passes them).

---

## Featured work — sticky stacked cards

**Structure**: a section containing N `.card` elements, each 100svh-ish with a large image, index (`01/04`), title, tags.

**Option A (CSS sticky, no pin)**: cards `position: sticky; top: 0`. Each card animates as the next one arrives: `scale 1→0.85`, `rotationX: 0→45` (with `perspective` on the parent) or `filter: brightness(0.5)` via a `--overlay` custom property, scrubbed from `top top` of the next card.

**Option B (one pin)**: pin the section for `innerHeight * cards`. In `onUpdate`: `p = progress * total`; for each card `cp = clamp(0,1,p - i)`, `np = clamp(0,1,p - (i+1))`; `y: interpolate("200%", "-50%", cp)`, `scale: interpolate(1, 0.85, np)`, `--overlay-opacity: np * 0.5`.

**Option C (exit stack)**: the active card exits up, rotating ~20° and moving forward in Z (`parseEase("power2.in")` on segment progress); cards behind step forward with `back.out(2)` after a 30% delay in the segment.

Mobile: plain vertical list with simple reveals.

---

## Services / process

- **Accordion rows**: rows grow on hover (`height` tween measured from content, `elastic.out(1,0.5)`), images rise inside with stagger 0.075. Neighbors shrink slightly.
- **Pinned process steps**: pin for `innerHeight * steps`; step index from progress; number scrambles, description lines slide.
- **Horizontal scroll**: pin and translate a track `x: -(track.scrollWidth - innerWidth)`, `ease: "none"`, `scrub: 1`, `end: () => "+=" + track.scrollWidth`.

---

## Spotlight (signature pinned scene)

The single most memorable section; give it 4–10 viewports of scroll.

Recipe ideas (pick one, tune to the concept):
- **Slit to full**: image clip from a 1% vertical slit to full, then a cascade of images opens from center points, then outro text splits in halves that slide apart.
- **Shrink to square**: full-screen image shrinks to a 150px square while headline words fade in one by one; side images parallax.
- **Logo travel**: a gallery shrinks (1→0.5) while the inner images counter-zoom (1.25→1) and the logo scales from 6→1 traveling into the nav.
- **Zoom-through**: an SVG mark zooms ×20 toward a focal point to transition into the next section.
- **Card flip deck**: cards enter, flip (latched `elastic.out` tween) and dismiss in phases.

Implement with the pinned-scene pattern (`motion-language.md`). Desktop-only via `matchMedia`; on mobile show a simplified stacked version.

---

## Marquee

Infinite horizontal loop of words/logos.

```js
const tween = gsap.to(track, {
  x: () => -half, duration: 30, ease: "none", repeat: -1,
  modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % half) },
});
el.addEventListener("mouseenter", () => gsap.to(tween, { timeScale: 0, duration: 0.5 }));
el.addEventListener("mouseleave", () => gsap.to(tween, { timeScale: 1, duration: 0.5 }));
```

Duplicate the content once so the track is 2× wide; `half` = width of one copy. Variant: tie `timeScale` to Lenis velocity for scroll-reactive speed and direction.

---

## Testimonials / clients

- Draggable carousel (`Draggable` + inertia, or pointer events with lerp).
- Pinned quote stack: one quote per viewport segment, masked line swap.
- Client logo grid with hover reveal of a project image following the cursor (`quickTo` x/y, `elastic.out` on enter).

---

## CTA

Full-bleed image or color block, huge type ("Let's talk"), one button. Optional: image clip from `inset20` to `full` on scroll; magnetic button.

---

## Footer

- **Reveal-from-behind**: footer `position: fixed; bottom: 0; z-index: 0; height: 100svh`; `main` has a solid background and `z-index: 1`; a transparent spacer of `100svh` after `main` lets the page lift off the footer. Animate footer content at `top 50%` of the spacer (enter 1s `power3.out`, leave-back 0.4s `power2.in`).
- **Slide-up**: footer content `y: 500 → 0` scrubbed as the footer enters.
- Giant wordmarks overflow: give the footer `overflow: clip` so they don't add stray scroll.
- **Contents**: giant full-width wordmark (fit with `font-size` in `vw` or an SVG with `viewBox`), link columns, a live clock (`Intl.DateTimeFormat` with `timeZone`, update every second), social links, copyright, back-to-top.
- **Playful extras** (only if on-brand): physics tags falling in, ASCII logo that pushes away from the cursor, chars rising `from: "center"`.

---

## Navigation

Fixed top bar: logo left, a few links or a menu toggle right, label type. With 3–4 pages, inline links are often better than an overlay menu. Hide on scroll down / show on scroll up (`lenis.direction` or ScrollTrigger `onUpdate: self.direction`), `yPercent: -100`, 0.5s `power3.out`. For a nav that stays legible over light and dark sections, prefer switching a class per section (ScrollTrigger `onToggle` on dark sections sets `nav.is-dark`; give these triggers `refreshPriority: -1` so they measure **after** pins have added their spacing — otherwise a section containing a pin ends far too early) over `mix-blend-mode: difference`, which turns faint over mid-grey photos and can't be contrast-checked.

## Menu (overlay)

```html
<button class="menu-toggle" aria-expanded="false" aria-controls="menu">
  <span class="toggle-word"><span>Menu</span><span>Close</span></span>
</button>
<div id="menu" class="menu" hidden>…links (h2/h3 size), mono sub-links, contact…</div>
```

CSS start: `.menu { position: fixed; inset: 0; clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%); pointer-events: none; }`. Remove `hidden` before animating; put it back after closing.

Open choreography (one paused timeline, `play()`/`reverse()`):
1. `0`: menu clip → `full`, 1.25s `hop`; simultaneously the **page shell** moves (`y: -250, opacity: 0`) or rotates away (`rotation: 10, x: 300, y: 450, scale: 1.5`).
2. `~1.0`: link lines `yPercent 100→0`, 1s `power3.out`, stagger 0.075.
3. `~1.3`: sub-items, 0.75s, stagger 0.05.
4. Toggle word rolls (`yPercent -100`).

Variants: three colored layers `scaleY 0→1` from top (0.75s `power3.inOut`, stagger 0.1) before content; SVG path morph hidden → bulge → full (`power4.in` then `power4.out`); circle clip from the toggle position.

Single-page sites: in-page links inside the menu must close it first (Lenis is stopped while open), and anchor targets must be measured without the page push (`rect.top + scrollY - gsap.getProperty(".page", "y")`), or the scroll lands short by the push distance.

Behavior: `lenis.stop()` on open, `start()` on close; Escape closes; focus moves into the menu and is trapped; close on navigation (`astro:before-preparation`). Link hover: underline `scaleX 0→1` from left (0.4s `power3.out`) or double-char roll.

## Preloader

```html
<div class="preloader" aria-hidden="true">
  <p class="counter mono">000</p>
  <div class="preloader-images">…3–5 imgs…</div>
  <h2 class="preloader-title">Brand</h2>
</div>
```

Rules:
- First visit only: `sessionStorage.getItem("seen")`; set it when done. Never on client-side navigations.
- Skip entirely under reduced motion.
- `lenis.stop()` during; `lenis.start()` + `ScrollTrigger.refresh(true)` after; `preloader.remove()`.
- Total length 3–6s. Longer only if the preloader *is* the experience.
- The hero entrance must run on **every** visit to the page, not only after the preloader: `preloader.ts` exports an `introDone` promise; the hero's own `onPage(".hero")` awaits it (resolves immediately when there's no preloader). Mark hero copy `data-copy-manual` so the generic reveal skips it.

Example score (absolute times):
```
0.00  counter 000→100 (3s, "none"), progress bar scaleX 0→1 ("glide")
0.35  title chars rise (1s, "hop", stagger {each:0.075, from:"random"})
0.50  images clip in one after another (1s "hop", stagger 0.15), scale 1.5→1
3.25  title chars exit y:-100% (0.75s power3.in); bar origin→right, scaleX→0
4.35  .preloader clip → hiddenTop (1.25–1.75s "hop")
4.65  hero h1 chars y:0 (1s "hop", stagger 0.075 random); hero image scale 1.25→1
```
