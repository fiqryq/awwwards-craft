// Pinned-scene helper: one pinned ScrollTrigger + onUpdate that maps progress phases.
// Usage inside onPage(".scene", (root, { mm, reduced }) => {
//   if (reduced) return;
//   mm.add("(min-width: 1000px)", () => pinnedScene(root, { viewports: 5, render(p, phase) {
//     const a = phase(0, 0.25), b = phase(0.25, 0.45);
//     gsap.set(media, { clipPath: slit(a), rotate: gsap.utils.interpolate(0, 12, b) });
//   }}));
// });
import { gsap, ScrollTrigger } from "./lenis-gsap.js";

const { clamp } = gsap.utils;

export function pinnedScene(trigger, { viewports = 4, scrub = 1, pinSpacing = true, render, ...rest }) {
  let progress = 0;
  const phase = (start, end, ease) => {
    const t = clamp(0, 1, (progress - start) / (end - start));
    return ease ? gsap.parseEase(ease)(t) : t;
  };
  const st = ScrollTrigger.create({
    trigger, start: "top top",
    end: () => "+=" + window.innerHeight * viewports,
    pin: true, pinSpacing, scrub, invalidateOnRefresh: true,
    onUpdate: (self) => { progress = self.progress; render(progress, phase, self); },
    onRefresh: (self) => { progress = self.progress; render(progress, phase, self); },
    ...rest,
  });
  // onUpdate only fires once scrolling inside the pin — paint the start state now,
  // otherwise elements show their CSS/final state before the pin begins.
  progress = st.progress;
  render(progress, phase, st);
  return st;
}

// Polygon helpers for common clip shapes driven by 0..1
export const slitToFull = (t) => {
  const l = gsap.utils.interpolate(49.5, 0, t), r = gsap.utils.interpolate(50.5, 100, t);
  return `polygon(${l}% 0%, ${r}% 0%, ${r}% 100%, ${l}% 100%)`;
};
export const bottomUp = (t) => {
  const y = gsap.utils.interpolate(100, 0, t);
  return `polygon(0% ${y}%, 100% ${y}%, 100% 100%, 0% 100%)`;
};
export const insetTo = (t, from = 20) => {
  const i = gsap.utils.interpolate(from, 0, t), o = 100 - i;
  return `polygon(${i}% ${i}%, ${o}% ${i}%, ${o}% ${o}%, ${i}% ${o}%)`;
};
