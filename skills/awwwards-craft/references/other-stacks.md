# Other stacks

The design direction, CSS system and motion language are framework-independent. Only setup, lifecycle and transitions change. CSS stays pure in every stack: plain `.css` files, CSS Modules, or scoped styles — no Tailwind, even if the project already has it installed (don't remove it uninvited; just don't use it for new work, and mention it).

## Next.js (App Router)

- `npm i gsap @gsap/react lenis`.
- `app/layout.js` (server) renders a `"use client"` `ClientLayout` that holds `<ReactLenis root options={…} ref={lenisRef}>` from `lenis/react`, nav, menu, transition provider, `{children}`, footer.
- Lenis ↔ ScrollTrigger: `autoRaf: false`, then in `useEffect`: `gsap.ticker.add(t => lenisRef.current?.lenis?.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`, `lenis.on("scroll", ScrollTrigger.update)`; remove both in cleanup.
- Register plugins and custom eases once in `lib/gsap.js` (guard: `if (!CustomEase.get("hop")) CustomEase.create(...)`), import from there.
- Animations in components: `useGSAP(() => { … }, { scope: ref, dependencies: [...] })`. Keep refs to SplitText instances and revert them in the returned cleanup (useGSAP reverts GSAP objects, but early returns can skip your own cleanup — avoid early returns before registering cleanup).
- Reusable `<Copy>` component: splits its child after `document.fonts.ready`, clones a single child with a ref, or wraps multiple children in `div[data-copy-wrapper]`; props `animateOnScroll`, `delay`, `type`, `variant`, `start`.
- Preloader once per session: module-level `let isInitialLoad = true` set to false on unmount, plus `lenis.stop()` while running.
- Page transitions:
  - **View Transitions**: `next-view-transitions` (`<ViewTransitions>` + `useTransitionRouter().push(href, { onTransitionReady })` animating `::view-transition-old/new(root)` with `document.documentElement.animate(..., { pseudoElement })`), or React's `<ViewTransition enter exit>` in `app/template.jsx` where the Next version supports it (`experimental.viewTransition`).
  - **GSAP cover**: `next-transition-router` → `<TransitionRouter auto leave={(next) => { const tl = cover(next); return () => tl.kill(); }} enter={(next) => { lenis.scrollTo(0, { immediate: true }); const tl = uncover(next); return () => tl.kill(); }}>`.
- ScrollTriggers are created in **mount order**, not page order: after creating them call `ScrollTrigger.sort()` then `ScrollTrigger.refresh()` (or set `refreshPriority`), otherwise pins above other triggers miscalculate.
- Lenis may not exist yet when child components mount: expose it through context/state and let consumers react when it becomes available, or read it lazily inside handlers.
- Pre-paint flags (`js-motion`, `first-visit`, `?reduced`): render an inline `<script dangerouslySetInnerHTML>` in `app/layout.js` `<head>`, and add `suppressHydrationWarning` on `<html>` since the class changes before hydration.
- On route change, kill leftover triggers in a layout effect keyed by `pathname` only as a safety net — proper per-component cleanup is the real fix.
- Images: `next/image` with `sizes`; fonts: `next/font` CSS variables.

## Vanilla Vite (multi-page)

- One HTML file per page; `vite.config.js` → `build.rollupOptions.input` lists them; hosting rewrites (`/work` → `/work.html`).
- One ES module per feature (`lenis-scroll.js`, `preloader.js`, `menu.js`, `transition.js`, `copy.js`, one per page), each self-starting on `DOMContentLoaded`.
- Configure behavior with data attributes (`data-copy`, `data-variant`, `data-delay`).
- Transitions: native `@view-transition { navigation: auto }` (preferred) or the sessionStorage cover handoff (see page-transitions.md, family 4).
- The snippets in `assets/snippets/` work as-is; replace `onPage` with a direct call on `DOMContentLoaded` (each navigation is a fresh page).

## SvelteKit

- Lenis + ticker sync in `+layout.svelte` `onMount` (return cleanup).
- Per-component animations in `onMount` with `gsap.context(() => …, node)` and `return () => ctx.revert()`.
- Transitions: `onNavigate` + `document.startViewTransition` (official pattern), or a GSAP cover awaited inside `onNavigate` before resolving.
- Scoped `<style>` blocks are pure CSS by default.

## Nuxt / Vue

- Lenis in a client plugin; ticker sync there.
- `onMounted` → `gsap.context`, `onUnmounted` → `ctx.revert()`.
- Transitions: `<NuxtPage :transition="{ onLeave, onEnter, css: false }">` with GSAP JS hooks calling `done()`; or `experimental.viewTransition`.
