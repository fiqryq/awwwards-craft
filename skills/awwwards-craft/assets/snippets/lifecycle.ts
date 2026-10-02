// onPage(selector, setup): run page-scoped animation code safely under Astro's ClientRouter.
//
// - Runs on first load AND after every client-side navigation, only if `selector` exists.
// - Wraps setup in gsap.context + gsap.matchMedia; reverts all of it on `astro:before-swap`.
// - setup may return a cleanup function for non-GSAP resources (listeners, rAF, observers,
//   WebGL). From async code, register cleanup with onCleanup(fn) from the context.
// - setup must be synchronous. After an `await` (e.g. document.fonts.ready), create
//   tweens/splits inside `ctx.add(() => { ... })` (ctx from the context) so they are still reverted.
// - Many onPage() calls may target the same element ("main"): each registration is guarded
//   separately, so they never block each other.
// - Works without ClientRouter too (runs once on load).
import { gsap, reducedMotion } from "./lenis-gsap";

export type Cleanup = () => void;

export interface PageContext {
  /** gsap.matchMedia() scoped to this page visit — use mm.add("(min-width: 1001px)", ...) */
  mm: gsap.MatchMedia;
  /** gsap.context() scoped to the root — use ctx.add(() => ...) after an await */
  ctx: gsap.Context;
  /** prefers-reduced-motion (or ?reduced) */
  reduced: boolean;
  /** register extra cleanup from async code */
  onCleanup: (fn: Cleanup) => void;
}

export type PageSetup<T extends Element = HTMLElement> = (root: T, context: PageContext) => void | Cleanup;

const active = new Set<Cleanup>();

export function onPage<T extends Element = HTMLElement>(selector: string, setup: PageSetup<T>): void {
  // Elements THIS registration has set up and not yet cleaned up.
  const initialized = new WeakSet<Element>();

  const run = (): void => {
    const root = document.querySelector<T>(selector);
    // Module scripts can run before or after Astro's first `astro:page-load`,
    // so we run immediately AND listen; the WeakSet prevents double setup.
    if (!root || initialized.has(root)) return;
    initialized.add(root);
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {}, root);
    const extra: Cleanup[] = [];
    let userCleanup: void | Cleanup;
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
    try {
      cleanup();
    } catch (err) {
      console.error(err);
    }
  }
  active.clear();
});
