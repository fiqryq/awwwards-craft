# Motion language

A site feels "designed" when every motion belongs to the same family: same few eases, durations on a scale, staggers on a scale, entrances slower than exits. These defaults come from studying dozens of award-style production sites; they produce a confident, editorial feel. Deviate on purpose, not by accident.

## Eases

Register custom eases once (`assets/snippets/eases.ts`):

```js
CustomEase.create("hop",   "0.9, 0, 0.1, 1");   // big wipes, covers, preloader exits, menu clip, page transitions
CustomEase.create("glide", "0.8, 0, 0.2, 1");   // slightly softer in-out for large moves (images, bars)
CustomEase.create("soft",  "0.15, 1, 0.25, 1"); // gentle ease-out for drawers, carts, small panels
```

| Job | Ease |
|---|---|
| Copy lines / words sliding in | `power4.out` |
| General UI, labels, images entering | `power3.out` |
| Things that cover/uncover the screen (clip-path wipes, block grids, menu overlay) | `hop` |
| Shape moves, Flip layouts, shutters, morphs | `power3.inOut` / `power4.inOut` |
| Exits, things leaving the screen | `power2.in` / `power3.in` |
| Hover growth, playful cards | `elastic.out(1, 0.5)` |
| Pops, badges, sparkles | `back.out(1.7–2)` |
| Gallery focus / dimming | `expo.out` |
| Idle floating loops | `sine.inOut` + `yoyo` |
| Scrubbed timelines | `none` (let scroll be the ease), or shape segment progress with `gsap.parseEase()` |

CSS equivalents: `--ease-hop: cubic-bezier(0.9,0,0.1,1)`, `--ease-vt: cubic-bezier(0.87,0,0.13,1)` (view transitions), `--ease-out: cubic-bezier(0.22,1,0.36,1)` (buttons, hovers).

## Durations

| Duration | Use |
|---|---|
| 0.05–0.15s | flicker / scramble ticks |
| 0.25–0.5s | hover out, exits, small UI |
| 0.75s | text reveals, hover in |
| **1s** | default for almost everything |
| 1.25s | menu clip, page wipes |
| 1.5–1.75s | preloader exit wipe, CSS view transitions (1.5–2s) |
| 3–4s | preloader counter / progress bar |

## Staggers

| Unit | Stagger |
|---|---|
| Lines | 0.1 |
| Words | 0.05–0.075 |
| Chars | 0.015–0.04 (`from: "random"` for scatter, `"center"` for symmetric) |
| Blocks/tiles | 0.025, or `{ amount: 0.3 }`, `{ grid: [rows, cols], from: "center" }` |
| Lists / cards | 0.075–0.1 |

## Asymmetry

Entrances are slower, softer and more spread out; exits are faster, tighter and use `.in` eases. A reveal at `1s power3.out stagger 0.1` pairs with an exit at `0.4s power2.in stagger 0.05`. When reversing on scroll back, use a fresh shorter tween instead of `reverse()` of the long one.

## Overlaps

Chain with overlap so nothing waits for silence: `"-=0.5"`, `"-=0.75"`, `"<0.1"`, `"<0.25"`. For preloaders and hero entrances, place tweens on **absolute times** (e.g. `0.35`, `3.25`, `4.35`) so the choreography is readable and tweakable as a score.

## SplitText rules

```js
await document.fonts.ready;
const split = SplitText.create(el, {
  type: "lines",            // "words" | "chars" | "lines, words"
  mask: "lines",            // ALWAYS mask: text slides out of a clipping box
  linesClass: "line",
  autoSplit: true,          // re-splits on resize / font load
  onSplit(self) {           // return the animation so it is re-created on re-split
    return gsap.from(self.lines, { yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.1 });
  },
});
```

- Copy lines: `y: 110% → 0`, 1s, `power4.out`, stagger 0.1.
- Headline chars: `y: 100% → 0`, 1s, `power3.out` or `hop`, stagger 0.025–0.075 (often `from: "random"`). In preloaders, alternate direction: `yPercent: (i) => (i % 2 ? 100 : -100)`.
- Exit: `y: 0 → -100%`, 0.75s, `power3.in`.
- Accessibility: `aria: "auto"` adds `aria-label`, which is **prohibited on `<p>`, `<span>`, `<div>`** (axe/Lighthouse flag it). Use `aria: "auto"` only on headings split into chars; use `aria: "none"` for lines/words (the text stays readable as-is).
- Masks clip italics and descenders at tight line-heights: pad the mask wrappers (`[class$="-mask"] { padding: .12em .08em; margin: -.12em -.08em }`, see css-system.md).
- Don't split text that has `text-indent`; every line inherits it. Use an inline spacer span.
- Set start offsets in JS (`gsap.set(lines, { yPercent: 110 })`); a CSS `translateY(%)` start state is read by GSAP as pixel `y` and fights `yPercent`.
- `split.revert()` restores the markup captured at split time — if you replaced the text since (e.g. a slider title swap), revert first, then change the text, then split again.
- Revert splits in cleanup (`split.revert()`); `gsap.context` does it if the split was created inside the context.

## Text reveal variants

| Variant | Mechanic |
|---|---|
| **slide** (default) | masked lines/words rise from `y:110%`. |
| **flicker** | chars `opacity 0→1` with `duration 0.05`, stagger `{ amount: 0.3–0.5, from: "random" }`, sometimes `repeat: 1, yoyo`. |
| **scramble** | chars cycle random glyphs every 25–50ms before settling, staggered 50ms (or ScrambleTextPlugin). |
| **block wipe** | a colored block `scaleX 0→1` from left (0.5s `power4.inOut`), origin flips right, `scaleX 1→0`; text becomes visible at the midpoint. A second color 0.15s later adds richness. |
| **blur / gooey** | span `filter: blur(0.35em) → 0`, 1.5s `power3.out`, inside an SVG alpha-threshold filter (see effects-catalog). |
| **color fill on scroll** | chars switch from `--base-300` to `--fg` as scroll progress passes their index. |
| **word fade on scroll** | `opacity = clamp((p - i/n) * n)` per word while pinned. |

## Clip-path vocabulary

Always tween between polygons with the **same number of points** (4) so interpolation is clean.

```js
const CLIP = {
  full:         "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  hiddenBottom: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", // reveals upward
  hiddenTop:    "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",         // collapse upward (exit)
  hiddenLeft:   "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  hiddenRight:  "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
  slitV:        "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)", // 1% vertical slit
  center:       "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  inset20:      "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
};
// also: "circle(0% at 50% 50%)" → "circle(75% at 50% 50%)", "inset(0 0 100% 0)" → "inset(0)"
```

Put `will-change: clip-path` (or `transform`) on the animated element only while it animates on heavy pages.

## ScrollTrigger conventions

| Pattern | Settings |
|---|---|
| One-shot reveal | `start: "top 80%"` (75–90%), `once: true`, plays a paused tween. Copy reveals: `refreshPriority: -1`. |
| Parallax | `start: "top bottom", end: "bottom top", scrub: true`, `y` or `yPercent` ±10–25%. Images: scale 1.2–1.5 inside an `overflow:hidden` frame. |
| Pinned scene | `start: "top top", end: () => "+=" + innerHeight * N, pin: true, scrub: 1 (or true), invalidateOnRefresh: true`. N = 3–8, or the number of cards/images. |
| Overlap stack | same as pinned but `pinSpacing: false` so the next section slides over. |
| Enter/leave toggle | `onEnter` play / `onLeaveBack` reverse a paused timeline (chat bubbles, footer intros). |

### The pinned-scene pattern (use this for anything complex)

One pinned trigger, no nested timelines, and an `onUpdate` that maps progress phases to properties:

```js
const { clamp, interpolate, mapRange } = gsap.utils;
const phase = (p, start, end) => clamp(0, 1, (p - start) / (end - start));

ScrollTrigger.create({
  trigger: ".scene", start: "top top",
  end: () => "+=" + innerHeight * 5,
  pin: true, scrub: 1, invalidateOnRefresh: true,
  onUpdate: ({ progress: p }) => {
    const a = phase(p, 0.0, 0.25);   // slit opens
    const b = phase(p, 0.25, 0.45);  // rotate
    const c = phase(p, 0.45, 0.65);  // scale out, copy splits
    gsap.set(".scene-media", {
      clipPath: `polygon(${interpolate(49.5, 0, a)}% 0%, ${interpolate(50.5, 100, a)}% 0%, ${interpolate(50.5, 100, a)}% 100%, ${interpolate(49.5, 0, a)}% 100%)`,
      rotate: interpolate(0, 12, b),
      scale: interpolate(1, 0.6, c),
    });
  },
});
```

Why: it is deterministic in both scroll directions, easy to tune by moving phase windows, and cheap (only `gsap.set`). Shape a phase with `gsap.parseEase("power2.in")(a)`. For card stacks, compute `idx = Math.floor(p * (n - 1))` and `seg = p * (n - 1) - idx`.

For **discrete moments** inside a scrub (a flip, a pop), latch with a boolean and fire a normal timed tween: `if (p > 0.6 && !flipped) { flipped = true; gsap.to(card, { rotationY: 180, duration: 0.75, ease: "elastic.out(1,0.5)" }); }` and the reverse when `p` drops back.

Alternative for straightforward sequences: a timeline with tweens at absolute positions in "virtual seconds" (0–1) attached via `scrollTrigger: { …, scrub: true }`.

## Pointer-driven motion

- Lerp on `gsap.ticker`: `current += (target - current) * k`, `k = 0.05` (camera/tilt), `0.075–0.1` (cursor follow, scroll). Add the ticker callback on `mouseenter`, remove on leave/settle.
- Clamp drift (e.g. ±25px) and tilt (±20°). Counter-move inner images for parallax.
- Interruptible tweens: `overwrite: "auto"` (or named proxy objects for independent channels).
- Guards: `isAnimating`, `isOpen` flags on menus and sliders. Prefer one paused timeline with `play()` / `reverse()`; use separate open/close timelines only when the choreography differs.
- Disable pointer effects on touch: `matchMedia("(hover: hover) and (pointer: fine)")`.

## Reduced motion

When `prefers-reduced-motion: reduce`:
- No Lenis (native scroll), no pins, no scrub, no parallax, no WebGL loops, no preloader (or a 0.3s fade).
- Text and images appear in their final state, or fade in with `opacity` over 0.3s.
- Page transitions: instant swap (Astro does this automatically for its own animations; make GSAP covers skip too).

`lenis-gsap.ts` exports `reducedMotion`; `onPage()` passes `{ reduced }` to every setup.

## Performance rules

- Animate `transform`, `opacity`, `clip-path`, `filter` (sparingly). Never animate `top/left/width/height` in loops — exception: measured one-off height tweens on hover rows.
- Use `gsap.set` inside `onUpdate`; use `gsap.quickTo` / `quickSetter` for per-frame pointer updates.
- Batch reveals with `ScrollTrigger.batch` when there are dozens of items.
- Pause rAF/WebGL loops when off-screen (`IntersectionObserver`) and when the tab is hidden.
