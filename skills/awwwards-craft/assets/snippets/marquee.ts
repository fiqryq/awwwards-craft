// Infinite marquee. Markup: .marquee > .marquee-track > .marquee-item* (content duplicated once).
// Optional data-speed (seconds per loop), data-scroll-reactive to follow Lenis velocity/direction.
import type Lenis from "lenis";
import { gsap, lenis } from "./lenis-gsap";
import type { Cleanup } from "./lifecycle";

export function marquee(root: HTMLElement): Cleanup {
  const track = root.querySelector<HTMLElement>(".marquee-track");
  if (!track) return () => {};
  const half = (): number => track.scrollWidth / 2;
  const tween = gsap.to(track, {
    x: () => -half(),
    duration: parseFloat(root.dataset.speed ?? "30"),
    ease: "none",
    repeat: -1,
    modifiers: { x: gsap.utils.unitize((x: string | number) => parseFloat(String(x)) % half()) },
  });
  // Start deep into the repeat so negative timeScale (reverse direction) never hits time 0.
  tween.totalTime(tween.duration() * 1000);

  const onEnter = (): void => { gsap.to(tween, { timeScale: 0, duration: 0.5 }); };
  const onLeave = (): void => { gsap.to(tween, { timeScale: 1, duration: 0.5 }); };
  root.addEventListener("mouseenter", onEnter);
  root.addEventListener("mouseleave", onLeave);

  let offScroll: Cleanup | undefined;
  if (lenis && root.hasAttribute("data-scroll-reactive")) {
    const l = lenis;
    const onScroll = ({ velocity, direction }: Lenis): void => {
      gsap.to(tween, { timeScale: direction * (1 + Math.min(Math.abs(velocity) * 0.1, 4)), duration: 0.3, overwrite: true });
    };
    l.on("scroll", onScroll);
    offScroll = () => l.off("scroll", onScroll);
  }

  return () => {
    tween.kill();
    root.removeEventListener("mouseenter", onEnter);
    root.removeEventListener("mouseleave", onLeave);
    offScroll?.();
  };
}
