# Design direction

Award-winning sites are decided before the first line of code. The brief exists so that every later choice — a font size, an ease, a section order — has something to agree with.

## The brief (`BRIEF.md`)

```md
# <Brand> — creative brief
Concept:      <one sentence: the idea the whole site expresses>
Mood:         <3–5 words, e.g. "quiet, precise, warm, slow">
Audience:     <who, and what they should feel/do>
Palette:      <palette number from the library below + roles (paper / ink / accent)>
Type:         <Fontshare pair: Display font + weight · Body font + weight> (+ optional mono)
Grid:         <e.g. 12 col, 2rem gutters, max 2000px>
Signature:    <the ONE interaction people will remember>
Sections:     <ordered list>
Preloader:    <variant>    Menu: <variant>    Transition: <variant>
Imagery:      <photo direction, treatment (duotone, grain, b/w), aspect ratios>
Motion notes: <how fast/slow the site feels; where it is loud, where it is still>
```

Show the brief to the user in a few lines before building. If they gave almost no direction, choose boldly and say what you chose.

## Concept → art direction

Translate the brand into a metaphor that drives layout and motion. Invent a **fresh** metaphor from the brand's own material, place and audience every time — the examples below show the *kind* of thinking, they are not answers to reuse. If your concept sentence could be pasted onto a competitor's site, it is not specific enough.

| Brand type | Example of the thinking | Consequences |
|---|---|---|
| Physical craft (studio, maker) | Find the process: what does the work *do* to material, light, time? | Motion mirrors that process (cutting, folding, drying, layering); imagery revealed the same way. |
| Fashion / beauty | Find the viewing situation: runway, mirror, lens, darkroom, fitting | High contrast, oversized display type, transitions that behave like the viewing device. |
| Tech / finance | Find the instrument: gauge, ledger, signal, circuit | Mono-heavy labels, grid-snapped blocks, crisp `power3`, scramble/counter text. |
| Hospitality / food | Find the ritual and its tempo | Generous whitespace, soft slow fades, a menu that behaves like the ritual. |
| Culture / music / games | Find the medium's artifacts: tape, CRT, poster, glitch | Saturated palette, ASCII/CRT effects, flicker reveals, block transitions. |

## Color: the palette library

These palettes come from award-winning sites. **Always start from one of them**; don't invent palettes. Each lists `paper` (dominant background) and `ink` (text / dark surfaces). Pick by concept, and use a different one from the last site you built.

| # | Colors | Character | Contrast | Notes |
|---|---|---|---|---|
| 1 | `#FFFFFF` + `#1F2B5E` | Crisp white + deep navy | 13.4 : 1 | Corporate-luxury, editorial, finance, law, architecture. |
| 2 | `#E0DEE1` | Cool lavender-grey, single tone | — | One-color system: use as paper; ink `#0F0F0F` (14.8 : 1). Quiet, gallery-like. |
| 3 | `#F7F7F7` + `#1E1E1E` | Soft white + charcoal | 15.6 : 1 | The safe premium neutral. Studios, portfolios, product. |
| 4 | `#FFFFFF` + `#000000` | Pure black & white | 21 : 1 | Maximum contrast; brutalist, fashion, type-led sites. |
| 5 | `#FFFFFF` (+ `#FFF`) | All-white | — | Both values are white: an all-white canvas where imagery carries color. Ink `#0A0A0A`. |
| 6 | `#E5CF4F` + `#190BB6` | Mustard yellow + ultramarine | 7.6 : 1 | Loud, confident, graphic. Agencies, culture, events. Yellow as paper, blue as ink (or inverted sections). |
| 7 | `#FDF2DE` + `#3B60C5` | Cream + cornflower blue | 5.2 : 1 | Warm, friendly, heritage-modern. Blue passes AA for body text; use ≥ 1.1rem. |
| 8 | `#F8BBCB` + `#B5CEDB` | Pink + powder blue | 1.0 : 1 | Two **surfaces**, never text-on-each-other. Ink `#0A0A0A` on both (≈12 : 1). Playful, beauty, kids, candy. |
| 9 | `#F3AFCC` + `#000000` | Pink + black | 11.8 : 1 | Bold, fashion-forward, music, nightlife. |
| 10 | `#CFCFCF` + `#0F0F0F` | Concrete grey + near-black | 12.3 : 1 | Industrial, technical, architecture, automotive. |
| 11 | `#FFFFFF` + `#0A0A0A` | White + soft black | 19.8 : 1 | Clean minimal; lets photography lead. |

### From palette to tokens

Two or three source colors are enough: derive the in-between stops with `color-mix()` so components still get a full ramp. An accent, when needed, comes from the palette itself (e.g. palette 6's blue on a palette 3 site is *not* allowed — keep one palette).

```css
:root {
  /* palette 7 */
  --paper: #fdf2de;
  --ink:   #3b60c5;
  --ink-strong: #0a0a0a;   /* only when the palette's ink is too light for small text */

  --base-100: var(--paper);
  --base-200: color-mix(in oklab, var(--paper) 85%, var(--ink));
  --base-300: color-mix(in oklab, var(--paper) 55%, var(--ink));   /* muted labels — check contrast */
  --base-400: color-mix(in oklab, var(--paper) 20%, var(--ink));
  --base-500: var(--ink);
  --accent:   var(--ink);
}
```

Rules:
- Mix stops **`in oklab`**, not `in oklch`: oklch interpolates hue, so mixing a warm paper with a blue ink detours through pink/peach and loses contrast. Oklab blends in a straight line.
- Body text must reach 4.5 : 1 against its background; muted labels too if they carry meaning. Check derived stops (the `oklch-skill` helps).
- Invert for drama: dark sections use `--ink` as background and `--paper` as text.
- Palettes 2 / 5 / 8 need the stated ink for text.
- Photography carries extra color; grade images toward the palette (duotone, b/w, warm/cool) so they don't fight it.

## Typography: Fontshare pairs

Use a **Fontshare pair** (https://www.fontshare.com/pairs — free for commercial use, by the Indian Type Foundry). Load via the Astro Fonts API with `fontProviders.fontshare()` (see `astro-foundation.md`). The first font is the display/heading face, the second the body face, with the weights given.

Labels (`[ 01 ] Selected work`) use the body font, uppercase, `letter-spacing: 0.04em`, `font-variant-numeric: tabular-nums` — or add a Google mono (JetBrains Mono, DM Mono, Geist Mono) via `fontProviders.google()` when the concept is technical.

### Serif display — editorial, luxury, fashion, culture
- Zodiak Bold + Plus Jakarta Sans Regular
- Erode Semibold + Recia Regular
- Recia Medium + Supreme Regular
- Zina Regular + Recia Regular
- Boska Medium + Switzer Regular
- Boska Light + General Sans Light
- Gambarino Regular + Switzer Light
- Rosaline Regular + Satoshi Regular
- Melodrama Medium + Nunito Regular
- Satoshi Bold + Erode Regular *(sans head, serif body — editorial)*
- General Sans Semibold + Gambetta Regular *(sans head, serif body)*
- General Sans Medium + Recia Regular *(sans head, serif body)*
- Tanker Regular + Bespoke Serif Regular *(heavy display + serif body)*
- Tanker Regular + Erode Regular

### Neo-grotesk / Swiss — studios, tech, product, minimal
- General Sans Semibold + General Sans Regular
- Switzer Bold + Switzer Regular
- Cabinet Grotesk Extrabold + Satoshi Medium
- Clash Display Semibold + Archivo Regular
- Plein Bold + Switzer Regular
- Outfit Semi Bold + Switzer Light
- Archivo Semi Bold + Ranade Light
- Supreme Medium + Poppins Regular
- Technor Semibold + Supreme Regular
- Chillax Semibold + Synonym Regular
- Nunito Extra Bold + Supreme Regular
- General Sans Medium + Quicksand Medium
- Quicksand Semi Bold + Spline Sans Regular
- Poppins Semi Bold + Hind Regular
- Hind Bold + Amulya Regular

### Condensed / poster — sport, music, events, bold agencies
- Bebas Neue Regular + Nunito Regular
- Bebas Neue Regular + Zodiak Regular
- Khand Bold + Hind Regular
- Khand Bold + Switzer Regular
- Khand Semi Bold + General Sans Regular
- Khand Semi Bold + Supreme Regular
- Teko Semi Bold + Hind Regular
- Oswald Bold + Sentient Light
- Rajdhani Bold + Sentient Regular
- Array Regular + Khand Regular

### Expressive display — distinctive brands, art direction-led sites
- Amulya Bold + Synonym Regular
- Excon Medium + Ranade Light
- Sharpie Extrabold + Ranade Light
- Expose Bold + Bespoke Sans Regular
- Bevellier Medium + Satoshi Regular
- Quilon Medium + Rowan Regular
- New Title Medium + Amulya Regular
- Poppins Semi Bold + Bespoke Slab Regular

### Slab & stencil — industrial, editorial-technical
- Trench Slab Medium + General Sans Regular
- Bespoke Stencil Bold + Supreme Regular

### Rounded & playful — consumer, food, kids, friendly brands
- Chubbo Bold + Supreme Regular
- Pilcrow Rounded Semibold + Hind Regular
- Pilcrow Rounded Heavy + Archivo Regular
- Pilcrow Rounded Bold + Sentient Light
- Roundo Medium + Pilcrow Rounded Regular
- Pramukh Rounded Bold + Poppins Light
- Bonny Medium + Pilcrow Rounded Regular
- Pally Medium + Neco Regular
- Britney Regular + Quicksand Medium
- Comico Regular + Zodiak Regular

Groupings are a starting point — preview the pair on fontshare.com/pairs with the brand's real headline before committing.

Setting the display face: very large (`clamp()` up to ~20rem), line-height 0.85–1, slight negative tracking; uppercase works for condensed and grotesk faces, sentence case for serifs. Body: 1–1.15rem, line-height 1.2–1.4.

## Layout signatures that read as "award-level"

- Oversized display type that touches or bleeds off the container edges.
- Label rows: `[ 01 ]  Selected work  ·  2019—2026` at the top/bottom of sections.
- A **section footer** absolutely positioned at the bottom of a 100svh hero with two or three labels spread apart.
- Asymmetric splits: a 2/12 label column next to a 7/12 copy column, leaving columns empty on purpose.
- Images in strict aspect ratios (4:5, 3:4, 16:9), `object-fit: cover`, often with a clip-path reveal.
- A giant wordmark in the footer, full container width.
- Live details: a local clock with time zone, an index counter, current section number.

## Anti-generic checklist (review the brief against this)

- [ ] Not a centered hero with a gradient blob and a "Get started" button.
- [ ] Not three equal feature cards with icons.
- [ ] Palette comes from the library above, and differs from the last site built.
- [ ] Type is a Fontshare pair; display ≠ body face (unless the pair is a single family by design).
- [ ] There is a clear signature moment, not ten medium ones.
- [ ] The concept sentence is specific to this brand (not reusable from an example in this skill).
- [ ] Copy is specific to the brand (names, places, numbers), not placeholder.
- [ ] Variants (preloader / hero / menu / transition) differ from the last site you built.

## Variant menus (pick one of each, deliberately)

**Hero:** full-bleed image with display type overlaid · giant split headline with small image inset · image grid that collapses into one · type-only hero with section-footer labels · WebGL canvas hero · video frame that expands to full viewport.

**Preloader:** counter 000→100 + clip-away up · progress bar that grows then exits the other way · rotated image stack that spreads into the hero · grid of blocks that flicker/collapse · SVG stroke drawing a mark · none (instant, for content sites).

**Menu:** full overlay clipped in from bottom · stacked colored layers sliding down then content · page shell slides/rotates away to reveal menu · circle clip from the toggle · SVG bulge path morph.

**Page transition:** CSS view-transition clip-in · block grid / strips cover · SVG stroke scribble cover · fade-up old page + clip new page · native cross-document view transition (no JS).

## Imagery

When the user supplies no images, use real photography placeholders downloaded into `src/assets/` (Astro optimizes them). Unsplash *Source* (`source.unsplash.com`) is shut down — use direct photo URLs `https://images.unsplash.com/photo-<id>?w=2000&q=80` (verify each ID returns 200 before using it), and list every image with its URL in `BRIEF.md` so the user can replace them. Grade images toward the palette.
