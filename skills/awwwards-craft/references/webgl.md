# WebGL in award sites

WebGL earns its place when it *is* the concept (a liquid brand, a lens, a signal) — not as decoration. Every WebGL feature needs: a static fallback, DPR capped at 2, pause when off-screen or hidden, full disposal on navigation, and nothing at all under reduced motion.

## Setup in Astro

- `npm i three && npm i -D @types/three` (or `ogl`, which ships its own types, for tiny single-effect scenes).
- Type scene modules: `export function createScene(root: HTMLElement): () => void`, uniforms as `{ uProgress: { value: number }; uTexCurrent: { value: THREE.Texture | null } }`, and `THREE.ShaderMaterial<…>`-style explicit types where inference is weak.
- Mount in a component: `<div class="gl" data-gl><img class="gl-fallback" … /></div>`. The fallback image is visible by default; hide it with a class only after the first frame renders.
- Lazy-load three only when the element is near the viewport:

```js
onPage("[data-gl]", (root, { reduced }) => {
  if (reduced || !supportsWebGL()) return;
  let dispose = () => {};
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const { createScene } = await import("../scripts/gl/ripple-slider");
    dispose = createScene(root);   // must return a full cleanup function
  }, { rootMargin: "200px" });
  io.observe(root);
  return () => { io.disconnect(); dispose(); };
});
```

## Renderer boilerplate

```js
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(root.clientWidth, root.clientHeight);
root.appendChild(renderer.domElement);

// Fullscreen effect: orthographic camera + 1×1 plane
const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

const ro = new ResizeObserver(() => { renderer.setSize(root.clientWidth, root.clientHeight); material.uniforms.uResolution.value.set(root.clientWidth, root.clientHeight); });
ro.observe(root);

let visible = true;
const vis = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); vis.observe(root);
const tick = (t) => { if (!visible || document.hidden) return; material.uniforms.uTime.value = t; renderer.render(scene, camera); };
gsap.ticker.add(tick);   // shares GSAP's rAF with Lenis

return () => {
  gsap.ticker.remove(tick); ro.disconnect(); vis.disconnect();
  scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { Object.values(m.uniforms || {}).forEach((u) => u.value?.dispose?.()); m.dispose(); }); });
  renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
};
```

## Cover-fit UVs (object-fit: cover in a shader)

```glsl
vec2 coverUv(vec2 uv, vec2 planeRes, vec2 imageRes) {
  vec2 ratio = vec2(
    min((planeRes.x / planeRes.y) / (imageRes.x / imageRes.y), 1.0),
    min((planeRes.y / planeRes.x) / (imageRes.y / imageRes.x), 1.0)
  );
  return uv * ratio + (1.0 - ratio) * 0.5;
}
```

## Effect recipes

### Render on demand
Click-driven effects (sliders, transitions) don't need a 60fps loop: render once on load/resize, and add the ticker callback only while a tween runs (`onStart` → `gsap.ticker.add(render)`, `onComplete` → remove). Cheaper and simpler than pausing an always-on loop.

### Focal point
Cover-fit crops from the center; for portraits pass a per-image focal point uniform (`uFocus`, 0–1, like CSS `object-position`) and offset the crop: `uv = uv * ratio + (1.0 - ratio) * uFocus;`.

### Ripple displacement slider
Fullscreen ortho plane, two textures. A radial decaying sine wave expands from the click point, displacing UVs and crossfading behind the wavefront.
- Uniforms: `uTexCurrent, uTexNext, uProgress, uCenter, uResolution, uImageRes, uWaveFreq (≈25), uWavePow (≈0.035), uWaveWidth (≈0.5), uFalloff (≈10), uBoost (≈0.5), uCrossfade (≈0.05)`.
- `uProgress` tweened 0 → (max corner distance + wave width) over 3s (1.5s mobile), `power2.out`. Accept the next click once progress > 0.7.
- Shader core: see `assets/snippets/ripple.frag.glsl`.

### CRT / glitch screen
Uniforms `map, glitch, time, resolution`. Hashed horizontal line jitter scaled by `glitch`; RGB offset `0.001 + glitch * 0.025`; vignette `pow(16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y), 0.12)`; sine scanlines; noise × glitch. On content change, tween `glitch` 1 → 0 over 0.75s `power3.out`.

### Grid deformation (pointer velocity)
A small `DataTexture` (e.g. 25×25, `FloatType`, `NearestFilter` for the blocky look). Each frame multiply all cells by 0.925 (relax); near the pointer add `velocity * power`. Fragment: `shift = 0.015 * texture(uData, uv).rg`, sample R/G/B with `±shift*0.15` split for chromatic aberration. Works on images and video.

### Material spotlight
Inject into a `MeshStandardMaterial` via `onBeforeCompile`: uniforms `uHit, uRadius, uSoftness`; after `#include <roughnessmap_fragment>`, lower roughness and darken diffuse inside `smoothstep(radius, radius - softness, distance(worldPos, uHit))`. Raycast pointer to a `THREE.Plane`, lerp hit point 0.05.

### Fluid / ink simulation
Classic stable-fluids: half-float ping-pong render targets (sim 128–256, dye 512–1024), passes: splat → curl → vorticity → divergence → pressure (20–40 Jacobi iterations) → gradient subtract → advect velocity → advect dye (dissipation ~0.95). Display can threshold dye into a flat ink color and composite with `mix-blend-mode: difference`. Heavy: desktop-only, lower resolution on weaker GPUs.

### Velocity-bent image slider
Planes with 32×16 segments; cache original vertex positions; each frame set `z = sin(falloff * π/2)^1.5 * strength * velocity` so planes bend with scroll speed. Input from wheel/drag with lerp + momentum (0.95).

### Spiral / cylinder gallery
Tiles on a helix (e.g. 15 per revolution, radius tapering 5 → 3.5), curved custom geometry; rotation speed `0.001 + lenis.velocity * 0.0035` decaying ×0.9; camera y follows scroll (lerp 0.075); shade by facing ratio: `smoothstep(-0.2, 0.5, facing) * 0.45 + 0.42`.

### DOM ↔ WebGL image sync
For "WebGL images in the page" (hover distortion on project thumbnails): one fixed fullscreen canvas; for each `<img data-gl-img>` create a plane sized/positioned from `getBoundingClientRect()` every frame (cheap with Lenis scroll value); hide the DOM image with `opacity: 0` once its plane is ready; distort on hover via a `uHover` uniform tweened 0→1.

## Fallback & capability checks

```js
function supportsWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch { return false; }
}
const lowPower = navigator.hardwareConcurrency <= 4 || matchMedia("(max-width: 1000px)").matches;
```

On low power: reduce render target sizes, segments, particle counts — or show the fallback.
