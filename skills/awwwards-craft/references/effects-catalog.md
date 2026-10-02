# Effects catalog

One recipe per effect family. Each recipe gives: what it is, DOM/CSS setup, the motion numbers, and gotchas. All code runs inside an `onPage()` setup (see `astro-foundation.md`) so it is cleaned up on navigation.

Pick effects that serve the concept. A site needs maybe 4–6 of these, not 20.

## Contents
1. Landing reveals
2. Text effects
3. Hover & cursor effects
4. Scroll scenes
5. Sliders & galleries (wheel-driven)
6. Layout morphs (Flip)
7. SVG effects (stroke draw, goo mask, path morph)
8. ASCII / glyph effects
9. Canvas & physics extras

---

## 1. Landing reveals

All share: a fixed `.preloader` above the hero, a hero pre-transformed in CSS (scale 0.75, images clipped, nav `y:-100%`), one timeline with `delay: 0.5–1`, a clip-path exit with `hop`, and a hero entrance overlapping the exit by 0.3–0.75s.

| Variant | Mechanic |
|---|---|
| **Counter + clip up** | `{v:0}` tweened to 100 (3s, `none`), `onUpdate` writes `String(Math.round(v)).padStart(3,"0")`; then preloader clip → `hiddenTop` (1.5s `hop`). |
| **Bar grow & exit** | bar `scaleX 0→1` origin left (`glide`), then `transformOrigin: "right"` and `scaleX → 0` (`hop`). |
| **Two-tone wipe** | two stacked layers (`.preloader` + `.preloader-revealer` in the accent color) clip out 0.05–0.15s apart — gives a colored edge. |
| **Circle iris** | stacked revealers `clip-path: circle(0% → 100% at 50% 50%)`, stagger 0.25. |
| **Image stack spread** | 5 rotated, scaled images glide into a row; outer ones spread off-screen; the middle one grows into the hero image. |
| **Grid blocks** | odd count grid of tiles; tiles fade in at random; a marker hops between tiles with `Flip`; then tiles collapse `scaleY → 0` with `stagger: { each: 0.0035, from: "random" }`. |
| **SVG stroke progress** | an outline draws in random steps (`strokeDashoffset` to random progress points); optional click-to-enter, then preloader scales to 0.75 and wipes left. |
| **Conic wipe** | animate a custom property `--wipe: 0deg → 90deg` used in a `conic-gradient` mask. |

Gotchas: `lenis.stop()` while running; first visit only; remove the preloader node at the end; refresh ScrollTrigger after.

## 2. Text effects

See `motion-language.md` → SplitText rules and reveal variants. Extra recipes:

**Reusable copy reveal** — `assets/snippets/copy-reveal.js` scans `[data-copy]` elements:
- `data-copy="lines|words|chars"` (default lines)
- `data-variant="slide|flicker|scramble"`
- `data-delay="0.2"`, `data-scroll="false"` (play on load instead of on scroll), `data-start="top 80%"`

**Double-char roll (link hover)** — wrap text in `.original` + `.clone` spans (clone at `yPercent: 100`), split both into chars, interleave pairs, on enter `yPercent: -100` with `stagger: { amount: 0.2 }`, 0.5s `power3.out`, `overwrite: true`; on leave back to 0 with `from: "end"`.

**Toggle word roll** — two words stacked in a 1-line mask; open → `yPercent: -100`.

**Gooey blur reveal** — wrap lines in an element with `filter: url(#goo)`, where the SVG filter is `feGaussianBlur` + `feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"`; animate inner span `filter: blur(0.35em) → blur(0)`, 1.5s `power3.out`, stagger 0.1. The alpha threshold turns the blur into a liquid edge.

**Scramble** — `assets/snippets/scramble.js`: per char, cycle random glyphs every 25–50ms for 0.25s, then settle; stagger 50ms. Use mono fonts or fixed-width spans to avoid layout jitter.

**Masked word swap** — headline cycles words: current word `y: 0 → -100%`, next `100% → 0`, 0.75s `power3.inOut`, every 2s.

## 3. Hover & cursor effects

Only on `(hover: hover) and (pointer: fine)`.

**Magnetic element** (`assets/snippets/magnetic.js`) — on move, `quickTo(x/y)` toward `(pointer - center) * 0.3–0.4`; inner label moves extra (×0.15) for depth; on leave back to 0 with `elastic.out(1, 0.3)`, 1s.

**Cursor-follow preview** — a fixed image follows the cursor with `quickTo` (duration 0.6, `power3`); on row enter swap `src`, scale 0→1 `elastic.out(1,0.5)`, random rotation ±8°.

**Image trail** — on pointer move past a distance threshold (~80px), clone the next image at the pointer, animate `scale 0→1` then fade/scale out after 0.6s; cap concurrent images (~10).

**Row grow (list hover)** — hovered row grows +50px, neighbors shrink by inverse-distance weight; labels swap with blur; 0.5s `power2.out`.

**Accordion rows** — measure natural heights on load/resize; hover tweens `height` with `elastic.out(1,0.5)`, images inside rise with stagger 0.075; leave 0.35s `power3.out`.

**Focus dimming gallery** — hover item scales frame 1.1 and inner image 1.1→1 (counter-zoom); others `filter: saturate(0) brightness(0.35)`; 1s `expo.out`.

**Mosaic flip** — a grid of CSS-3D tiles each slicing the same background (`background-size: W H; background-position: -col*T -row*T`); on change `rotateY: n * 180`, 0.5s `power3.inOut`, `stagger: { each: 0.05, from: "center", grid: [rows, cols] }`. Load the new image on the hidden face first; queue requests while flipping.

**CSS-3D cube cards** — parent `perspective: 800–2000px`; card `transform-style: preserve-3d`; faces `backface-visibility: hidden` placed with `rotateY/rotateX(±90deg) translateZ(depth/2)`. Hover flips 180° on X; then pointer tilts it. Tween one proxy object (`{ flip, tiltX, tiltY }`) and apply in `onUpdate` so flip and tilt don't fight.

**Dot → card** — a small dot grows into an 18rem card on hover; pointer drift capped ±25px and tilt ±20°, lerp 0.075; inner image counter-moves.

**Spring card fan** — cards on springs: `v = (v + (rest + force - x) * 0.05) * 0.85`; pointer speed within a radius (500px) pushes them with falloff `(1 - d/R)^3`.

**Smudge / paint reveal** — a mask `<g>` filtered by goo (`feGaussianBlur stdDeviation=25` + alpha row `0 0 0 60 -14`); on pointer move (speed > threshold) append circles that grow ×2 over 2s and shrink to 0 over 3s (`power3.in`), then remove. The masked layer reveals a second image.

**Material spotlight (WebGL)** — see `webgl.md`.

## 4. Scroll scenes

Use the pinned-scene pattern from `motion-language.md`. Proven scene ideas:

| Scene | Mechanic |
|---|---|
| Slit → full → cascade | 1% slit opens to full (0–0.5), images cascade open from center points `0.4 + i*0.04` (dur 0.16). |
| Clip, rotate, scale out | slit (0–0.25) → rotate 65° (0.25–0.45) → scale 0 while side copy splits apart (0.45–0.65) → outro images wipe in (0.65–0.85). |
| Image shrink + word fade | full-screen image → 150px square; words fade one by one by threshold. `pinSpacing: false`, next section slides over. |
| Clip-edge dissolve stack | stack of images; each top edge moves down per segment; a band of random glyph cells rides the edge. |
| SVG zoom-through | an SVG mark scales ×20 toward a focus point; a lens image fades in after 0.5; words reveal 0.65–0.85. |
| Path-follow mascot | an element follows authored x/y keyframes sampled with smoothstep from a scrubbed proxy; tilt from look-ahead derivative. |
| Row width expansion | rows grow from 125% to 500% width based on their own viewport progress (no pin). |
| Chat/FAQ bubbles | at `top 85%` pop scale 0→1 (64px circles), at `top 75%` expand width then height (0.4s `power3.inOut`), copy fades. Leave-back reverses chained. |
| Scroll-wave gallery | per image trigger; summed sines set `x`; `inset()` clip grows toward viewport edges. |
| SVG stroke cover | thick strokes draw in order (`strokeDashoffset → 0`) to cover the screen, message swaps, strokes draw out (`→ -length`). |

Always: `end` as a function, `invalidateOnRefresh: true`, desktop-only for heavy scenes, static fallback on mobile/reduced motion.

## 5. Sliders & galleries (wheel-driven virtual scroll)

None of these use ScrollTrigger; they own the wheel inside their section (or the whole page if the page *is* the slider — then disable Lenis on that page).

Core loop:
```js
let target = 0, current = 0;
const onWheel = (e) => { e.preventDefault(); target += e.deltaY * 0.5; };
el.addEventListener("wheel", onWheel, { passive: false });
const tick = () => {
  current += (target - current) * 0.075;
  items.forEach((item, i) => {
    let x = (i * gap - current) % total; if (x < 0) x += total; if (x > total / 2) x -= total; // centered wrap
    const d = Math.min(1, Math.abs(x) / (total / 2));
    gsap.set(item, { x, scale: Math.max(0.25, 1 - d * 0.8), zIndex: Math.round((1 - d) * 100) });
  });
};
gsap.ticker.add(tick);
return () => { gsap.ticker.remove(tick); el.removeEventListener("wheel", onWheel); };
```

Mirror with touch/pointer drag (pointer capture, `deltaX/Y * 2`), add momentum (`velocity *= 0.95`). Recycle DOM (change `src` only when the index changes) for long lists.

Variants: **arc carousel** (y from `(1 - cos(d*π))/2 * depth`, lift at center) · **3D ring** (`rotateY(i * 360/n) translateZ(r)`, stage tilts ±30° with pointer) · **tilted ellipse orbit** (idle rotation, wheel adds speed that eases back) · **geometric-size stream** (slide widths grow by ratio `r^pos`) · **split-screen** (left column wipes up, right wipes down; titles hold at center via smoothstep) · **3D tunnel** (layers 2500px apart in Z under `perspective: 1000px`, wheel moves `z`, modulo wrap, fade by depth).

## 6. Layout morphs (Flip)

```js
const state = Flip.getState(items);
applyLayout(nextPreset);                // change classes / inline positions
Flip.from(state, { duration: 1.25, ease: "power3.inOut", absolute: true, stagger: { amount: 0.1, from: "center" } });
```

Use for: grid ↔ list toggles, "creative clutter" presets (scattered rotated images), filter changes, an element hopping between containers (preloader marker, nav logo).

## 7. SVG effects

**Stroke draw**: `len = path.getTotalLength(); path.style.strokeDasharray = path.style.strokeDashoffset = len;` → tween `strokeDashoffset: 0` to draw, `-len` to draw out in the same direction. Animate `attr: { "stroke-width": … }` for covers (200 → 700). Use `preserveAspectRatio="none"` on full-screen cover SVGs.

**Path morph overlay**: precompute `d` strings from viewport size:
```js
const hidden = `M${w},0 Q${w/2},0 0,0 L0,0 L${w},0 Z`;
const bulge  = `M${w},${h*0.4} Q${w/2},${h*0.75} 0,${h*0.4} L0,0 L${w},0 Z`;
const full   = `M${w},${h} Q${w/2},${h} 0,${h} L0,0 L${w},0 Z`;
tl.to(path, { attr: { d: bulge }, duration: 0.5, ease: "power4.in" })
  .to(path, { attr: { d: full },  duration: 0.5, ease: "power4.out" });
```
Pair with menu link chars flying in from `x: "750%"` with `elastic.out(1, 0.25)`, stagger 0.01.

**Goo filter**: see text effects / smudge reveal. Keep blur radius proportional to element size.

## 8. ASCII / glyph effects

Shared pipeline (`assets/snippets/ascii.js`):
1. Draw the source image/logo into a tiny offscreen canvas (`cols × rows`, rows = `cols / aspect`).
2. `getImageData` → luma `0.299R + 0.587G + 0.114B`.
3. Map to a ramp like `" .:-=+*#%@"` (invert for dark-on-light).
4. Render to a visible canvas with `fillText` at DPR ≤ 2 (fast) or to a grid of spans (only for < ~2,000 cells).
5. Animate: radial reveal (`delay = dist * 0.015`), shuffled reveal (2ms per cell), scramble dense cells, pointer push with springs (spring 0.025, damping 0.5), random-walk highlight clusters on hover.

Uses: hero image reveal (ASCII first, swap to real image), interactive logo, footer toy. Disable or simplify below 1000px.

## 9. Canvas & physics extras

- **Warp starfield** (Canvas 2D): ~1000 streaks along random angles; `travel = (speed * t - offset) % 1`; gradient tail→head; driven by scroll progress inside a pinned `+=500%` section.
- **Physics tags** (matter-js): on hover/enter, drop DOM pills into a world with floor + walls; sync bodies to DOM transforms each tick; destroy on leave (`Engine.clear`, `cancelAnimationFrame`, remove nodes). Lazy-load the library.
- **Live clock**: `new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" })`, updated every second; clear the interval in cleanup.
