// Reusable text reveals driven by data attributes.
//   <h2 data-copy>                          lines slide up on scroll (default)
//   <h1 data-copy="chars" data-variant="flicker" data-scroll="false" data-delay="0.4">
// Attributes: data-copy="lines|words|chars", data-variant="slide|flicker|scramble",
//             data-delay (s), data-scroll="false" to play on load, data-start ("top 80%").
// CSS (global):
//   html.js-motion [data-copy] { visibility: hidden }   — revealed once split
//   [class$="-mask"] { padding: 0.12em 0.06em; margin: -0.12em -0.06em; }  — masks must not clip
//                     italics/descenders at tight line-heights
// Don't use text-indent on [data-copy] (every split line inherits it); use an inline spacer span.
// Start transforms live in JS (gsap.set yPercent) — a CSS translateY(%) is read by GSAP as px `y`
// and fights a yPercent tween.
import { gsap, ScrollTrigger, SplitText } from "./lenis-gsap.js";
import { onPage } from "./lifecycle.js";
import { scramble } from "./scramble.js";

export function revealCopy(el, { delay = 0 } = {}) {
  const type = el.dataset.copy || "lines";
  const variant = el.dataset.variant || "slide";
  const onScroll = el.dataset.scroll !== "false";
  const start = el.dataset.start || "top 80%";
  const extraDelay = parseFloat(el.dataset.delay || "0") + delay;

  const split = SplitText.create(el, {
    type: type === "chars" ? "words, chars" : type,
    mask: variant === "slide" ? type : undefined,
    linesClass: "line", wordsClass: "word", charsClass: "char",
    // aria-label is prohibited on <p>/<div>; only headings get "auto". Lines/words stay readable anyway.
    aria: /^H[1-6]$/.test(el.tagName) ? "auto" : "none",
  });
  const targets = split[type];
  gsap.set(el, { visibility: "visible" });

  let tween;
  if (variant === "flicker") {
    gsap.set(targets, { opacity: 0 });
    tween = gsap.to(targets, {
      opacity: 1, duration: 0.05, delay: extraDelay, paused: onScroll,
      stagger: { amount: 0.5, from: "random" },
    });
  } else if (variant === "scramble") {
    gsap.set(targets, { opacity: 0 });
    tween = gsap.delayedCall(extraDelay, () => scramble(split.chars || targets)).pause();
    if (!onScroll) tween.play();
  } else {
    const stagger = { lines: 0.1, words: 0.06, chars: 0.03 }[type];
    gsap.set(targets, { yPercent: 110 });
    tween = gsap.to(targets, {
      yPercent: 0, duration: 1, ease: type === "lines" ? "power4.out" : "power3.out",
      stagger, delay: extraDelay, paused: onScroll,
    });
  }

  if (onScroll) {
    ScrollTrigger.create({ trigger: el, start, once: true, refreshPriority: -1, onEnter: () => tween.play() });
  }
  return split;
}

onPage("main", (root, { ctx, reduced }) => {
  const els = root.querySelectorAll("[data-copy]");
  if (reduced) { gsap.set(els, { visibility: "visible" }); return; }
  document.fonts.ready.then(() => {
    ctx.add(() => els.forEach((el) => {
      // Hero copy waiting on the preloader opts out with data-copy-manual and is revealed by preloader.js
      if (!el.hasAttribute("data-copy-manual")) revealCopy(el);
    }));
  });
});
