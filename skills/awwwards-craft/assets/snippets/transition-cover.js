// GSAP cover page transition for Astro's ClientRouter (page-transitions.md, family 2).
// Requires: <html transition:animate="none">, a persisted overlay:
//   <div class="transition" transition:persist> 10× <div class="block"/> </div>
//   .transition { position:fixed; inset:0; z-index:1000; pointer-events:none;
//                 display:grid; grid-template:repeat(2,1fr)/repeat(5,1fr) }
//   .block { background: var(--base-500); transform: scaleY(0); transform-origin: top }
import { gsap, reducedMotion } from "./lenis-gsap.js";

// Look the overlay up at call time: if transition:persist isn't on the overlay's ROOT element,
// Astro replaces it on every swap and a cached reference animates a detached node.
const getOverlay = () => document.querySelector(".transition");
const GRID = { grid: [2, 5], axis: "x", each: 0.08 };
let covered = false;

function cover() {
  const overlay = getOverlay();
  overlay.style.pointerEvents = "all";
  return gsap.to(overlay.querySelectorAll(".block"), {
    scaleY: 1, transformOrigin: "top", duration: 0.9, ease: "power4.inOut",
    stagger: { ...GRID, from: "start" }, overwrite: true,
  });
}

function uncover() {
  const overlay = getOverlay();
  return gsap.to(overlay.querySelectorAll(".block"), {
    scaleY: 0, transformOrigin: "bottom", duration: 0.9, ease: "power4.inOut",
    stagger: { ...GRID, from: "start" }, overwrite: true,
    onComplete: () => { overlay.style.pointerEvents = "none"; },
  });
}

if (getOverlay() && !reducedMotion) {
  document.addEventListener("astro:before-preparation", (event) => {
    const load = event.loader;
    event.loader = async () => {
      // Fetch the next page while the cover plays; swap only when both are done.
      await Promise.all([cover().then(), load()]);
      covered = true;
    };
  });

  document.addEventListener("astro:page-load", () => {
    if (!covered) return;
    covered = false;
    // small hold so the new page's first frame is painted under the cover
    gsap.delayedCall(0.1, uncover);
  });
}

export { cover, uncover };
