// Pinned-scene helper: one pinned ScrollTrigger + render(progress) that maps progress phases.
// Usage inside onPage("[data-scene]", (root, { mm, reduced }) => {
//   if (reduced) return;
//   mm.add("(min-width: 1001px)", () => pinnedScene(root, { viewports: 5, render(p, phase) {
//     const a = phase(0, 0.25), b = phase(0.25, 0.45);
//     gsap.set(media, { clipPath: slitToFull(a), rotate: gsap.utils.interpolate(0, 12, b) });
//   }}));
// });
import { gsap, ScrollTrigger } from "./lenis-gsap";

const { clamp, interpolate } = gsap.utils;

/** 0..1 progress of a sub-window [start, end] of the scene, optionally eased. */
export type PhaseFn = (start: number, end: number, ease?: string) => number;

export interface PinnedSceneOptions
  extends Omit<ScrollTrigger.Vars, "trigger" | "start" | "end" | "pin" | "onUpdate" | "onRefresh"> {
  /** pin length in viewport heights (recomputed on refresh) */
  viewports?: number;
  render: (progress: number, phase: PhaseFn, self: ScrollTrigger) => void;
}

export function pinnedScene(
  trigger: Element,
  { viewports = 4, scrub = 1, pinSpacing = true, render, ...rest }: PinnedSceneOptions
): ScrollTrigger {
  let progress = 0;
  const phase: PhaseFn = (start, end, ease) => {
    const t = clamp(0, 1, (progress - start) / (end - start));
    return ease ? gsap.parseEase(ease)(t) : t;
  };
  const st = ScrollTrigger.create({
    trigger,
    start: "top top",
    end: () => "+=" + window.innerHeight * viewports,
    pin: true,
    pinSpacing,
    scrub,
    invalidateOnRefresh: true,
    onUpdate: (self) => { progress = self.progress; render(progress, phase, self); },
    onRefresh: (self) => { progress = self.progress; render(progress, phase, self); },
    ...rest,
  });
  // onUpdate only fires once scrolling inside the pin — paint the start state now.
  progress = st.progress;
  render(progress, phase, st);
  return st;
}

// Polygon helpers for common clip shapes driven by 0..1
export const slitToFull = (t: number): string => {
  const l = interpolate(49.5, 0, t);
  const r = interpolate(50.5, 100, t);
  return `polygon(${l}% 0%, ${r}% 0%, ${r}% 100%, ${l}% 100%)`;
};
export const bottomUp = (t: number): string => {
  const y = interpolate(100, 0, t);
  return `polygon(0% ${y}%, 100% ${y}%, 100% 100%, 0% 100%)`;
};
export const insetTo = (t: number, from = 20): string => {
  const i = interpolate(from, 0, t);
  const o = 100 - i;
  return `polygon(${i}% ${i}%, ${o}% ${i}%, ${o}% ${o}%, ${i}% ${o}%)`;
};
