// Reusable text reveals driven by data attributes.
//   <h2 data-copy>                          lines slide up on scroll (default)
//   <h1 data-copy="chars" data-variant="flicker" data-scroll="false" data-delay="0.4">
// Attributes: data-copy="lines|words|chars", data-variant="slide|flicker|scramble",
//             data-delay (s), data-scroll="false" to play on load, data-start ("top 80%").
// CSS (global):
//   html.js-motion [data-copy] { visibility: hidden }   — revealed once split
//   [class$="-mask"] { padding: 0.12em 0.08em; margin: -0.12em -0.08em; }  — masks must not clip
// Don't use text-indent on [data-copy] (every split line inherits it); use an inline spacer span.
// Start transforms live in JS (gsap.set yPercent) — a CSS translateY(%) is read by GSAP as px `y`.
import { gsap, ScrollTrigger, SplitText } from "./lenis-gsap";
import { onPage } from "./lifecycle";
import { scramble } from "./scramble";

export type CopyType = "lines" | "words" | "chars";
export type CopyVariant = "slide" | "flicker" | "scramble";

export interface RevealOptions {
  /** extra delay in seconds, added to data-delay */
  delay?: number;
}

const STAGGER: Record<CopyType, number> = { lines: 0.1, words: 0.06, chars: 0.03 };

const isCopyType = (v: string | undefined): v is CopyType => v === "lines" || v === "words" || v === "chars";
const isVariant = (v: string | undefined): v is CopyVariant => v === "slide" || v === "flicker" || v === "scramble";

export function revealCopy(el: HTMLElement, { delay = 0 }: RevealOptions = {}): SplitText {
  const type: CopyType = isCopyType(el.dataset.copy) ? el.dataset.copy : "lines";
  const variant: CopyVariant = isVariant(el.dataset.variant) ? el.dataset.variant : "slide";
  const onScroll = el.dataset.scroll !== "false";
  const start = el.dataset.start ?? "top 80%";
  const extraDelay = parseFloat(el.dataset.delay ?? "0") + delay;

  const split = SplitText.create(el, {
    type: type === "chars" ? "words, chars" : type,
    ...(variant === "slide" ? { mask: type } : {}), // masks only for slide reveals
    linesClass: "line",
    wordsClass: "word",
    charsClass: "char",
    // aria-label is prohibited on <p>/<div>; only headings get "auto". Lines/words stay readable anyway.
    aria: /^H[1-6]$/.test(el.tagName) ? "auto" : "none",
  });
  const targets: Element[] = split[type];
  gsap.set(el, { visibility: "visible" });

  let anim: gsap.core.Animation;
  if (variant === "flicker") {
    gsap.set(targets, { opacity: 0 });
    anim = gsap.to(targets, {
      opacity: 1, duration: 0.05, delay: extraDelay, paused: onScroll,
      stagger: { amount: 0.5, from: "random" },
    });
  } else if (variant === "scramble") {
    gsap.set(targets, { opacity: 0 });
    anim = gsap.delayedCall(extraDelay, () => { scramble(split.chars.length ? split.chars : targets); });
    if (onScroll) anim.pause();
  } else {
    gsap.set(targets, { yPercent: 110 });
    anim = gsap.to(targets, {
      yPercent: 0, duration: 1, ease: type === "lines" ? "power4.out" : "power3.out",
      stagger: STAGGER[type], delay: extraDelay, paused: onScroll,
    });
  }

  if (onScroll) {
    ScrollTrigger.create({ trigger: el, start, once: true, refreshPriority: -1, onEnter: () => { anim.play(); } });
  }
  return split;
}

onPage("main", (root, { ctx, reduced }) => {
  const els = root.querySelectorAll<HTMLElement>("[data-copy]");
  if (reduced) {
    gsap.set(els, { visibility: "visible" });
    return;
  }
  void document.fonts.ready.then(() => {
    ctx.add(() => {
      els.forEach((el) => {
        // Hero copy waiting on the preloader opts out with data-copy-manual (revealed by preloader.ts)
        if (!el.hasAttribute("data-copy-manual")) revealCopy(el);
      });
    });
  });
});
