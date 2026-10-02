// House eases. Import once (lenis-gsap.js does it).
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

const EASES = {
  hop: "0.9, 0, 0.1, 1",    // wipes, covers, preloader exits, menu clip, page transitions
  glide: "0.8, 0, 0.2, 1",  // large in-out moves (images, bars)
  soft: "0.15, 1, 0.25, 1", // gentle ease-out for drawers and small panels
};

for (const [name, curve] of Object.entries(EASES)) {
  if (!CustomEase.get(name)) CustomEase.create(name, curve);
}

export const CLIP = {
  full: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  hiddenBottom: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
  hiddenTop: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  hiddenLeft: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  hiddenRight: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
  slitV: "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)",
  center: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  inset20: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
};
