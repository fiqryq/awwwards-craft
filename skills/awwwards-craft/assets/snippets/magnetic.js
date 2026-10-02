// Magnetic hover for buttons/links: <a class="btn" data-magnetic><span>Label</span></a>
import { gsap } from "./lenis-gsap.js";

const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

export function magnetic(el, { strength = 0.35, inner = 0.15 } = {}) {
  if (!finePointer) return () => {};
  const label = el.firstElementChild;
  const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
  const lx = label && gsap.quickTo(label, "x", { duration: 0.6, ease: "power3" });
  const ly = label && gsap.quickTo(label, "y", { duration: 0.6, ease: "power3" });

  const move = (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    xTo(dx * strength); yTo(dy * strength);
    lx?.(dx * inner); ly?.(dy * inner);
  };
  const leave = () => {
    gsap.to([el, label].filter(Boolean), { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)", overwrite: true });
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
}
