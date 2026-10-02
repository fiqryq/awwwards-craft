# CSS system (pure CSS, no Tailwind)

Global tokens + a small set of global utilities in `src/styles/global.css`; everything else in scoped `<style>` blocks inside components. No utility framework, no CSS-in-JS.

## Layer order

```css
@layer reset, tokens, base, layout, components, utilities;
```

Astro's scoped styles get a hashed attribute selector, so they already win over most globals; layers keep the global file predictable.

## Tokens

```css
@layer tokens {
  :root {
    /* palette from the library in design-direction.md (example: palette 3) */
    --paper: #f7f7f7;
    --ink:   #1e1e1e;
    --base-100: var(--paper);
    --base-200: color-mix(in oklab, var(--paper) 85%, var(--ink));
    --base-300: color-mix(in oklab, var(--paper) 50%, var(--ink));
    --base-400: color-mix(in oklab, var(--paper) 15%, var(--ink));
    --base-500: var(--ink);
    --accent:   var(--ink);

    --bg: var(--base-100);
    --fg: var(--base-500);
    --muted: var(--base-300);

    /* Fontshare pair via the Astro Fonts API; mono is optional */
    --ff-display: var(--font-display), system-ui, sans-serif;
    --ff-body:    var(--font-body), system-ui, sans-serif;
    --ff-mono:    var(--font-mono, var(--font-body)), ui-monospace, monospace;

    /* spacing */
    --gutter: 2rem;
    --space-xs: 0.5rem; --space-s: 1rem; --space-m: 2rem; --space-l: 4rem; --space-xl: 8rem;
    --container-max: 2000px;

    /* motion (CSS side) */
    --ease-hop:  cubic-bezier(0.9, 0, 0.1, 1);
    --ease-out:  cubic-bezier(0.22, 1, 0.36, 1);
    --ease-vt:   cubic-bezier(0.87, 0, 0.13, 1);
  }
  @media (max-width: 1000px) {
    :root { --gutter: 1.25rem; }
  }
}
```

## Reset & base

```css
@layer reset {
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  img, video, canvas, svg { display: block; max-width: 100%; }
  img, video { width: 100%; height: 100%; object-fit: cover; }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
  a { color: inherit; text-decoration: none; }
}

@layer base {
  html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: clip; }
  body { background: var(--bg); color: var(--fg); font-family: var(--ff-body); overflow-x: clip; }

  h1, h2, h3, h4 {
    font-family: var(--ff-display); font-weight: 700;
    line-height: 0.9; letter-spacing: -0.02em; text-wrap: balance;
  }
  h1 { font-size: clamp(4rem, 12vw, 20rem); line-height: 0.85; }
  h2 { font-size: clamp(3rem, 8vw, 13rem); }
  h3 { font-size: clamp(2rem, 5vw, 8rem); }
  h4 { font-size: clamp(1.5rem, 3vw, 4rem); }
  p  { font-size: 1.1rem; line-height: 1.2; letter-spacing: -0.01em; text-wrap: pretty; }
  p.lg { font-size: clamp(1.25rem, 2vw, 2rem); line-height: 1.1; }
  p.sm { font-size: 0.9rem; }

  ::selection { background: var(--accent); color: var(--base-100); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
}
```

Display type usually reads better **uppercase** for grotesks and **sentence case** for serifs. Keep display line-height 0.85–1.1 and add slight negative tracking; body tracking near zero.

## Labels

```css
@layer utilities {
  .mono {
    font-family: var(--ff-mono); font-size: 0.8rem; line-height: 1;
    text-transform: uppercase; letter-spacing: 0.04em; font-variant-numeric: tabular-nums;
  }
  .mono.bracket::before { content: "[ "; }
  .mono.bracket::after  { content: " ]"; }
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
```

## Container & grid

```css
@layer layout {
  .container { width: 100%; max-width: var(--container-max); margin-inline: auto; padding-inline: var(--gutter); }

  .cols { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); }
  .col-2 { grid-column: span 2; } .col-3 { grid-column: span 3; } .col-4 { grid-column: span 4; }
  .col-6 { grid-column: span 6; } .col-7 { grid-column: span 7; } .col-8 { grid-column: span 8; }
  .col-12 { grid-column: 1 / -1; }
  @media (max-width: 1000px) { .cols > * { grid-column: 1 / -1; } }

  section { position: relative; }
  .full { height: 100svh; overflow: hidden; }
}
```

Use flex with `flex: 1` children for simple rows (label left / label right). Use the 12-col grid for editorial asymmetry (e.g. label in `col-2`, copy in `col-7` starting at column 5 via `grid-column: 5 / span 7`).

## Section footer (hero labels)

```css
.section-footer {
  position: absolute; inset-inline: 0; bottom: 0;
  display: flex; justify-content: space-between; align-items: flex-end;
  padding: var(--gutter);
}
```

## Units & breakpoints

- Heights: `100svh` (not `vh`) for full-screen sections; `150svh`, `125svh`, `75svh` for taller or partial ones.
- Type: `clamp(min-rem, vw, max-rem)`.
- One main breakpoint: `@media (max-width: 1000px)`. Optional `@media (min-width: 2000px)` to cap giant type.
- Use `aspect-ratio` on image wrappers so layout is stable before images load.

## Split-text safety

```css
@layer utilities {
  /* SplitText masks clip italics, overhangs and descenders at tight line-heights — pad them */
  [class$="-mask"] { padding: 0.12em 0.08em; margin: -0.12em -0.08em; }
  /* split pieces must not inherit indents */
  [data-copy] .line, [data-copy] .word { text-indent: 0; }
}
```

Never put `text-indent` on text that gets split; use an inline spacer instead: `<span class="indent" aria-hidden="true"></span>` with `.indent { display: inline-block; width: 20%; }`.

## Initial animation states live in CSS

Anything that animates in must start hidden **in CSS** so there is no flash before JS runs, and must be visible when JS is off or motion is reduced:

```css
/* hidden only when JS is running and motion is allowed */
html.js-motion [data-copy] { visibility: hidden; }       /* JS splits, sets yPercent, then reveals */
html.js-motion .reveal-img { clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%); }
html.js-motion .preloader { display: flex; }
.preloader { display: none; }
```

Prefer `clip-path`, `opacity` and `visibility` for CSS start states. **Avoid CSS `transform: translateY(%)` start states on elements GSAP will move with `yPercent`**: GSAP reads the computed transform as a pixel `y`, so the element ends up offset. If you must, tween with both `{ yPercent: 0, y: 0 }`, or set the start in JS with `gsap.set(el, { yPercent: 110 })`.

Set the class with a tiny inline script in `<head>` (runs before paint):

```html
<script is:inline>
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
    document.documentElement.classList.add("js-motion");
</script>
```

With `<ClientRouter />`, Astro replaces the `<html>` attributes with the new document's on every swap, so the class can disappear. `lenis-gsap.ts` adds it back on `astro:after-swap`. Keep that if you change the boot code.

## Buttons (CSS-only hover)

```css
.btn {
  position: relative; display: inline-flex; align-items: center; gap: 0.75rem;
  padding: 0.9rem 1.25rem; overflow: hidden; isolation: isolate;
  background: var(--fg); color: var(--bg);
}
.btn::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: var(--accent); transform: translateY(101%);
  transition: transform 350ms var(--ease-out);
}
.btn:hover::before { transform: translateY(0); }
@media (prefers-reduced-motion: reduce) { .btn::before { transition: none; } }
```

## Scoped component styles

```astro
<section class="hero full">…</section>
<style>
  .hero { display: grid; place-items: end start; padding: var(--gutter); background: var(--base-500); color: var(--base-100); }
  .hero h1 { max-width: 12ch; }
  @media (max-width: 1000px) { .hero { place-items: center start; } }
</style>
```

Cascade-layer gotcha: an `!important` declaration inside a layer beats **unlayered** scoped component styles (layer order reverses for important declarations). Don't use `!important` in global layers; give components their own responsive rules.

When JS injects markup inside a component (SplitText lines, cloned marquee items), style it with `:global()`: `.hero :global(.line) { … }`.
