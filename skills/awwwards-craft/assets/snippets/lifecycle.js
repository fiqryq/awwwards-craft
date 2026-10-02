// onPage(selector, setup): run page-scoped animation code safely under Astro's ClientRouter.
//
// - Runs on first load AND after every client-side navigation, only if `selector` exists.
// - Wraps setup in gsap.context + gsap.matchMedia; reverts all of it on `astro:before-swap`.
// - setup(root, { mm, ctx, reduced, onCleanup }) may return a cleanup function for non-GSAP
//   resources (listeners, rAF loops, observers, WebGL). From async code, register cleanup
//   with onCleanup(fn).
// - setup must be synchronous. After an `await` (e.g. document.fonts.ready), create
//   tweens/splits inside `ctx.add(() => { ... })` so they are still reverted.
// - Many onPage() calls may target the same element (e.g. "main"): each registration is
//   guarded separately, so they never block each other.
// - Works without ClientRouter too (runs once on load).
import { gsap, reducedMotion } from "./lenis-gsap.js";

const active = new Set();

export function onPage(selector, setup) {
  // Elements THIS registration has set up and not yet cleaned up.
  const initialized = new WeakSet();

  const run = () => {
    const root = document.querySelector(selector);
    // Module scripts can run before or after Astro's first `astro:page-load`,
    // so we run immediately AND listen; the WeakSet prevents double setup.
    if (!root || initialized.has(root)) return;
    initialized.add(root);
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {}, root);
    const extra = [];
    let userCleanup;
    ctx.add(() => {
      userCleanup = setup(root, { mm, ctx, reduced: reducedMotion, onCleanup: (fn) => extra.push(fn) });
    });
    active.add(() => {
      if (typeof userCleanup === "function") userCleanup();
      extra.forEach((fn) => fn());
      mm.revert();
      ctx.revert();
      initialized.delete(root); // persisted elements get set up again on the next page
    });
  };

  run();
  document.addEventListener("astro:page-load", run);
}

document.addEventListener("astro:before-swap", () => {
  for (const cleanup of active) {
    try { cleanup(); } catch (err) { console.error(err); }
  }
  active.clear();
});
