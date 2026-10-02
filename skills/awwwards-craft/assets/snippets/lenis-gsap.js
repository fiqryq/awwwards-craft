// One-time boot: GSAP plugins, house eases, a single Lenis instance synced to ScrollTrigger,
// and Astro ClientRouter hooks. Every other module imports gsap & friends from here.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";
import "./eases.js";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// `?reduced` in the URL forces reduced motion — browser tools often can't emulate the media query.
export const reducedMotion =
  matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("reduced");
const isMobile = matchMedia("(max-width: 1000px)").matches;

export let lenis = null;

if (!reducedMotion) {
  lenis = new Lenis(
    isMobile
      ? { duration: 0.8, lerp: 0.09, syncTouch: true, touchMultiplier: 1.5, autoRaf: false }
      : { duration: 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), lerp: 0.1, touchMultiplier: 2, autoRaf: false }
  );
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Debug handle for QA (works in preview builds too). Don't use window.lenis: Lenis sets it itself.
window.__aww = { gsap, ScrollTrigger, lenis, reducedMotion };

// Astro swaps <html> attributes on navigation; restore the motion flag and reset scroll.
document.addEventListener("astro:after-swap", () => {
  if (!reducedMotion) document.documentElement.classList.add("js-motion");
  if (lenis) {
    lenis.resize();
    if (!location.hash) lenis.scrollTo(0, { immediate: true, force: true });
  }
});

document.addEventListener("astro:page-load", async () => {
  await document.fonts.ready;
  ScrollTrigger.refresh();
  // Hash links (e.g. /#work from another page): jump after pins are measured.
  const target = location.hash && document.querySelector(decodeURIComponent(location.hash));
  if (target) lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView();
});

export { gsap, ScrollTrigger, SplitText, Flip };
