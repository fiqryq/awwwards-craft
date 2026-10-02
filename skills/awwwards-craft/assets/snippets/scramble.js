// Scramble chars through random glyphs before settling. Works on SplitText chars or any elements.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

export function scramble(chars, { duration = 250, tick = 40, stagger = 40 } = {}) {
  const timers = [];
  chars.forEach((el, i) => {
    const final = el.textContent;
    if (!final.trim()) { el.style.opacity = 1; return; }
    timers.push(setTimeout(() => {
      el.style.opacity = 1;
      const started = performance.now();
      const id = setInterval(() => {
        if (performance.now() - started >= duration) { el.textContent = final; clearInterval(id); return; }
        el.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }, tick);
      timers.push(id);
    }, i * stagger));
  });
  return () => timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
}
