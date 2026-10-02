// Infinite marquee. Markup: .marquee > .marquee-track > .marquee-item* (content duplicated once).
// Optional data-speed (seconds per loop), data-scroll-reactive to follow Lenis velocity/direction.
import { gsap, lenis } from "./lenis-gsap.js";

export function marquee(root) {
  const track = root.querySelector(".marquee-track");
  const half = () => track.scrollWidth / 2;
  const tween = gsap.to(track, {
    x: () => -half(), duration: parseFloat(root.dataset.speed || "30"), ease: "none", repeat: -1,
    modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % half()) },
  });

  // Start deep into the repeat so negative timeScale (reverse direction) never hits time 0.
  tween.totalTime(tween.duration() * 1000);

  const onEnter = () => gsap.to(tween, { timeScale: 0, duration: 0.5 });
  const onLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.5 });
  root.addEventListener("mouseenter", onEnter);
  root.addEventListener("mouseleave", onLeave);

  let offScroll;
  if (lenis && root.hasAttribute("data-scroll-reactive")) {
    const onScroll = ({ velocity, direction }) =>
      gsap.to(tween, { timeScale: direction * (1 + Math.min(Math.abs(velocity) * 0.1, 4)), duration: 0.3, overwrite: true });
    lenis.on("scroll", onScroll);
    offScroll = () => lenis.off("scroll", onScroll);
  }

  return () => {
    tween.kill();
    root.removeEventListener("mouseenter", onEnter);
    root.removeEventListener("mouseleave", onLeave);
    offScroll?.();
  };
}
