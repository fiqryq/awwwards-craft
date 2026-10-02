// Scramble chars through random glyphs before settling. Works on SplitText chars or any elements.
import type { Cleanup } from "./lifecycle";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

export interface ScrambleOptions {
  /** ms each char scrambles before settling */
  duration?: number;
  /** ms between glyph swaps */
  tick?: number;
  /** ms between chars starting */
  stagger?: number;
}

export function scramble(
  chars: ArrayLike<Element>,
  { duration = 250, tick = 40, stagger = 40 }: ScrambleOptions = {}
): Cleanup {
  const timers: number[] = [];
  Array.from(chars).forEach((node, i) => {
    const el = node as HTMLElement;
    const final = el.textContent ?? "";
    if (!final.trim()) {
      el.style.opacity = "1";
      return;
    }
    timers.push(
      window.setTimeout(() => {
        el.style.opacity = "1";
        const started = performance.now();
        const id = window.setInterval(() => {
          if (performance.now() - started >= duration) {
            el.textContent = final;
            window.clearInterval(id);
            return;
          }
          el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "#";
        }, tick);
        timers.push(id);
      }, i * stagger)
    );
  });
  return () => timers.forEach((t) => {
    window.clearTimeout(t);
    window.clearInterval(t);
  });
}
