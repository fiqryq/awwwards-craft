// Ripple displacement transition between two textures (webgl.md).
// Fullscreen ortho plane; uProgress tweened 0 → maxCornerDist + uWaveWidth.
precision highp float;

uniform sampler2D uTexCurrent;
uniform sampler2D uTexNext;
uniform vec2  uResolution;   // plane size in px
uniform vec2  uImageRes;     // texture size in px
uniform vec2  uCenter;       // ripple origin in 0..1 (aspect-corrected below)
uniform float uProgress;
uniform float uWaveFreq;     // ~25
uniform float uWavePow;      // ~0.035
uniform float uWaveWidth;    // ~0.5
uniform float uFalloff;      // ~10
uniform float uBoost;        // ~0.5
uniform float uCrossfade;    // ~0.05

varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  vec2 ratio = vec2(
    min((uResolution.x / uResolution.y) / (uImageRes.x / uImageRes.y), 1.0),
    min((uResolution.y / uResolution.x) / (uImageRes.y / uImageRes.x), 1.0)
  );
  return uv * ratio + (1.0 - ratio) * 0.5;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 coord  = vec2(vUv.x * aspect, vUv.y);
  vec2 center = vec2(uCenter.x * aspect, uCenter.y);
  float dist  = distance(coord, center);

  // behind the wavefront: trailing < 0
  float trailing = dist - uProgress;
  vec2 offset = vec2(0.0);
  float brightness = 0.0;

  if (trailing < 0.0 && -trailing < uWaveWidth) {
    float age   = -trailing;
    float decay = exp(-age * uFalloff);
    float wave  = sin(age * uWaveFreq) * decay;
    offset      = normalize(coord - center + 1e-5) * wave * uWavePow;
    brightness  = abs(wave) * uBoost * decay;
  }

  vec2 uv = coverUv(vUv + vec2(offset.x / aspect, offset.y));
  float blend = smoothstep(0.0, uCrossfade, -trailing);
  vec4 color = mix(texture2D(uTexCurrent, uv), texture2D(uTexNext, uv), blend);
  color.rgb += color.rgb * brightness;
  gl_FragColor = color;
}
