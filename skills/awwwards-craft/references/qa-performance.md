# QA & performance loop

Run this loop after the first full build and again after every major change. Do the checks yourself; don't hand an unverified site to the user.

## 1. Build

```bash
npm run build
PORT=$((4400 + RANDOM % 500))       # random port: parallel agents/projects collide on defaults
npx astro preview --port $PORT      # Astro 7 may background the server; stop it with `npx astro preview stop`
```

Stop every server you start — by PID or `astro preview stop`, never with a broad `pkill` pattern that can hit other projects.

Fix every build error and warning about missing images/fonts before looking at visuals.

## 2. Visual pass (any browser automation tool)

Use whatever browser tool your environment provides — Chrome DevTools MCP, Playwright (MCP or `npx playwright screenshot`), Puppeteer, or a built-in browser. The steps below use generic names (`new_page`, `resize_page`, `take_screenshot`, `evaluate_script`); map them to your tool. If no browser tool exists, run `npm run build` checks, then ask the user to review in their browser and describe exactly what to look at.

1. `new_page` → the preview URL.
2. `resize_page` 1440×900 → `take_screenshot` of the hero; scroll in steps (`evaluate_script`: `window.__aww.lenis ? window.__aww.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)`, then wait ~1.2s) and screenshot each section, including mid-pinned-scene states. (`window.lenis` is Lenis's own version object — don't use it.) Wait out the preloader first (~6s) or test with `sessionStorage.seen = "1"`.
3. `resize_page` 390×844 → repeat (some browser windows can't go below ~500px wide; then also check 390 with `emulate` viewport if available). Look for overflow, clipped headings, tiny tap targets, broken grids.
4. `list_console_messages` → zero errors, zero GSAP warnings ("target not found", "invalid property").

Judge screenshots against the brief and the anti-generic checklist: is the hierarchy dramatic enough, is the type big enough, does the signature moment actually land?

## 3. Motion pass

- First-load preloader → hero handoff: no dead frame, no flash of final-state content before the preloader.
- Every revealed element starts hidden (no flash) and ends exactly at its layout position.
- Pinned scenes: scroll down and back up; no jumps at pin start/end, no gap after unpin.
- Resize the window mid-page: pins recalculate (`invalidateOnRefresh`), splits re-split (`autoSplit`).
- Navigate A → B → A → B (if multi-page): run `evaluate_script` with `window.__aww.ScrollTrigger.getAll().length` (and canvas count for WebGL) on each visit — the count must be stable per page. Also check the menu still opens and the cover still plays on the **second and third** navigation (persistence bugs only show up then).
- Menu: open/close quickly several times (guards hold), Escape closes, focus is trapped and restored.

## 4. Reduced motion

Open the page with `?reduced` in the URL (`lenis-gsap.js` and the head script treat it as reduced motion — DevTools tools often can't emulate the media query), or `emulate` it if supported:
- No preloader, no Lenis, no pins; all content visible in final state.
- Page navigation is an instant swap.
- The site still looks designed — this is the static layout you built first.

## 5. Lighthouse

`lighthouse_audit` (mobile and desktop) on the home page and one inner page. Some MCP Lighthouse tools omit the Performance category — then record a performance trace (`performance_start_trace`/`stop_trace`) for LCP/CLS/TBT, and say which you measured.

| Metric | Budget |
|---|---|
| Performance (mobile) | ≥ 85 (WebGL-heavy: ≥ 75 and explain) |
| Accessibility | ≥ 90 |
| Best practices / SEO | ≥ 90 |
| LCP | < 2.5s |
| CLS | < 0.05 |
| TBT | < 200ms |

Common fixes:
- **LCP**: hero image via `<Image loading="eager" fetchpriority="high">`; don't hide the LCP element behind a long preloader on repeat visits (preloader is first-visit only); preload display font.
- **CLS**: aspect-ratio boxes for media; `font-display: swap` with metric-compatible fallbacks (Astro Fonts API generates fallbacks).
- **TBT**: lazy-import three/matter/heavy modules; split per-section scripts; avoid giant SplitText `chars` splits on long paragraphs (use lines/words).
- **A11y**: contrast of `--muted` labels; `alt` text; button names; `lang`; heading order; visible focus.

## 6. Final checklist

- [ ] `BRIEF.md` exists and the site matches it.
- [ ] No Tailwind or utility framework anywhere (`package.json`, config, class soup).
- [ ] Tokens on `:root`; components use tokens, not raw hex.
- [ ] Fonts loaded via Astro Fonts API (or licensed local files).
- [ ] SplitText only after `document.fonts.ready`, always masked.
- [ ] Cleanup on `astro:before-swap` via `onPage`.
- [ ] Reduced motion handled everywhere.
- [ ] WebGL has a fallback and disposes.
- [ ] Desktop 1440 and mobile 390 screenshots reviewed.
- [ ] Lighthouse budgets met (or deviations explained to the user).

When reporting to the user, include the screenshots or describe what you verified, the Lighthouse numbers, and any known compromises.
