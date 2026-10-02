// Image/logo → ASCII on a canvas, with a radial reveal and optional pointer push.
// asciiReveal(canvas, imgEl, { cols, ramp, color, interactive }) → cleanup
import { gsap } from "./lenis-gsap.js";

export function sampleAscii(img, cols, ramp = " .:-=+*#%@", invert = false) {
  const rows = Math.round(cols / (img.naturalWidth / img.naturalHeight) / 2); // glyphs ≈ 2:1 tall
  const c = document.createElement("canvas");
  c.width = cols; c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const o = (y * cols + x) * 4;
      let lum = (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255;
      if (invert) lum = 1 - lum;
      const ch = ramp[Math.floor(lum * (ramp.length - 1))];
      if (ch !== " ") cells.push({ x, y, ch, alpha: 0, ox: 0, oy: 0, vx: 0, vy: 0 });
    }
  }
  return { cols, rows, cells };
}

export function asciiReveal(canvas, img, { cols = 120, ramp, invert = false, color = "currentColor", interactive = true } = {}) {
  const { rows, cells } = sampleAscii(img, cols, ramp, invert);
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);
  let cw, ch, pointer = { x: -1e4, y: -1e4 };

  const resize = () => {
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const fill = color === "currentColor" ? getComputedStyle(canvas).color : color;

  // radial reveal from center
  const cx = cols / 2, cy = rows / 2;
  cells.forEach((c) => (c.dist = Math.hypot(c.x - cx, (c.y - cy) * 2)));
  const reveal = gsap.to(cells, { alpha: 1, duration: 0.01, stagger: (i) => cells[i].dist * 0.015 });

  const onMove = (e) => { const r = canvas.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; };
  if (interactive) canvas.addEventListener("pointermove", onMove);

  const draw = () => {
    const sx = cw / cols, sy = ch / rows;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = fill;
    ctx.font = `${sy}px ui-monospace, monospace`;
    ctx.textBaseline = "top";
    for (const c of cells) {
      if (!c.alpha) continue;
      if (interactive) {
        const px = c.x * sx, py = c.y * sy;
        const dx = px - pointer.x, dy = py - pointer.y, d = Math.hypot(dx, dy), R = 80;
        if (d < R) { const f = (1 - d / R) * 6; c.vx += (dx / (d || 1)) * f; c.vy += (dy / (d || 1)) * f; }
        c.vx += -c.ox * 0.025; c.vy += -c.oy * 0.025;  // spring home
        c.vx *= 0.5; c.vy *= 0.5;                       // damping
        c.ox += c.vx; c.oy += c.vy;
      }
      ctx.globalAlpha = c.alpha;
      ctx.fillText(c.ch, c.x * sx + c.ox, c.y * sy + c.oy);
    }
    ctx.globalAlpha = 1;
  };
  gsap.ticker.add(draw);

  return () => { gsap.ticker.remove(draw); reveal.kill(); ro.disconnect(); canvas.removeEventListener("pointermove", onMove); };
}
