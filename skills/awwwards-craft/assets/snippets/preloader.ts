// First-visit preloader + hero entrance on EVERY page visit.
// Markup lives in Preloader.astro (see layouts-sections.md). A head inline script adds
// `first-visit` to <html> when !sessionStorage.seen; CSS shows .preloader only under
// `html.js-motion.first-visit`.
//
// Exports `introDone`: resolves when the preloader has finished (or right away if there is none).
// Page entrance code awaits it, so hero copy lines up with the wipe on the first visit and plays
// immediately on later navigations.
import { gsap, ScrollTrigger, SplitText, lenis, reducedMotion } from "./lenis-gsap";
import { CLIP } from "./eases";
import { onPage } from "./lifecycle";
import { revealCopy } from "./copy-reveal";

let resolveIntro: () => void = () => {};
export const introDone: Promise<void> = new Promise<void>((resolve) => { resolveIntro = resolve; });

const el = document.querySelector<HTMLElement>(".preloader");
const firstVisit = document.documentElement.classList.contains("first-visit");
const HERO_OVERLAP = 1.1; // seconds before the preloader finishes that the hero starts

if (!el || !firstVisit || reducedMotion) {
  el?.remove();
  resolveIntro();
} else {
  lenis?.stop();
  void document.fonts.ready.then(() => {
    const title = SplitText.create(".preloader-title", { type: "chars", mask: "chars", charsClass: "char" });
    const counter = { v: 0 };
    const counterEl = el.querySelector<HTMLElement>(".counter");
    const tl = gsap.timeline({ delay: 0.5, defaults: { ease: "hop" } });

    tl.to(counter, {
      v: 100, duration: 3, ease: "none",
      onUpdate: () => { if (counterEl) counterEl.textContent = String(Math.round(counter.v)).padStart(3, "0"); },
    }, 0)
      .from(title.chars, { yPercent: (i: number) => (i % 2 ? 100 : -100), duration: 1, stagger: { each: 0.075, from: "random" } }, 0.35)
      .to(".preloader-images img", { clipPath: CLIP.full, duration: 1, stagger: 0.15 }, 0.5)
      .to(title.chars, { yPercent: -100, duration: 0.75, ease: "power3.in", stagger: 0.03 }, 3.25)
      .to(el, { clipPath: CLIP.hiddenTop, duration: 1.5 }, 3.9)
      .add(() => resolveIntro(), 5.4 - HERO_OVERLAP)
      .add(() => {
        sessionStorage.setItem("seen", "1");
        document.documentElement.classList.remove("first-visit");
        el.remove();
        lenis?.start();
        ScrollTrigger.refresh(true);
      }, 5.4);
  });
}

// Hero entrance: runs on every visit to a page that has a .hero.
onPage(".hero", (root, { ctx, reduced }) => {
  const manual = root.querySelectorAll<HTMLElement>("[data-copy-manual]");
  if (reduced) {
    gsap.set(manual, { visibility: "visible" });
    return;
  }
  void Promise.all([introDone, document.fonts.ready]).then(() => {
    ctx.add(() => {
      manual.forEach((node, i) => revealCopy(node, { delay: 0.1 + i * 0.1 }));
      gsap.fromTo(root.querySelectorAll(".hero-media img"), { scale: 1.25 }, { scale: 1, duration: 1.5, ease: "hop" });
    });
  });
});
