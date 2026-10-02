// Overlay menu with page-shell push. Put `transition:persist` on the menu's ROOT element in
// Menu.astro so this module (which runs once) keeps valid references across navigations.
// Markup: button.menu-toggle[aria-expanded="false"][aria-controls=menu] > .toggle-word > span*2
//         #menu.menu[hidden] a.menu-link* .menu-sub*
// CSS:    .menu { position: fixed; inset: 0; clip-path: polygon(0% 100%,100% 100%,100% 100%,0% 100%) }
import { gsap, ScrollTrigger, SplitText, lenis, reducedMotion } from "./lenis-gsap.js";
import { CLIP } from "./eases.js";

const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

if (toggle && menu) {
  document.fonts.ready.then(() => initMenu(toggle, menu)); // split only after fonts load
}

function initMenu(toggle, menu) {
  let isOpen = false;
  let lastFocus = null;
  // aria "none": SplitText's default aria-label is prohibited on <p>/<div>, and lines stay readable anyway
  const links = SplitText.create(menu.querySelectorAll(".menu-link"), { type: "lines", mask: "lines", linesClass: "line", aria: "none" });
  const subs = SplitText.create(menu.querySelectorAll(".menu-sub"), { type: "lines", mask: "lines", linesClass: "line", aria: "none" });
  gsap.set([links.lines, subs.lines], { yPercent: 100 });

  const tl = gsap.timeline({
    paused: true,
    onReverseComplete: () => { menu.hidden = true; lastFocus?.focus(); },
  })
    .to(menu, { clipPath: CLIP.full, duration: reducedMotion ? 0.01 : 1.25, ease: "hop" }, 0)
    .to(".toggle-word span", { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, 0.1)
    .to(links.lines, { yPercent: 0, duration: 1, stagger: 0.075, ease: "power3.out" }, reducedMotion ? 0 : 0.9)
    .to(subs.lines, { yPercent: 0, duration: 0.75, stagger: 0.05, ease: "power3.out" }, reducedMotion ? 0 : 1.2);

  const focusables = () => [...menu.querySelectorAll("a, button, [tabindex]:not([tabindex='-1'])")];

  const setOpen = (open) => {
    if (open === isOpen) return;
    isOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    document.querySelector("main")?.toggleAttribute("inert", open);
    if (open) {
      lastFocus = document.activeElement;
      menu.hidden = false;
      lenis?.stop();
      tl.timeScale(1).play();
      // Pushing .page while a pinned section is active makes the pin jump; skip it then.
      const pinActive = ScrollTrigger.getAll().some((t) => t.pin && t.isActive);
      if (!reducedMotion && !pinActive) gsap.to(".page", { y: -250, opacity: 0, duration: 1.25, ease: "hop", overwrite: true });
      focusables()[0]?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      tl.timeScale(1.6).reverse(); // exits faster than entrances
      gsap.to(".page", { y: 0, opacity: 1, duration: 0.9, ease: "hop", overwrite: true, clearProps: "transform,opacity" });
    }
  };

  toggle.addEventListener("click", () => setOpen(!isOpen));
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "Tab") { // focus trap (toggle stays reachable so the menu can be closed)
      const items = [toggle, ...focusables()];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
      e.preventDefault();
      items[next].focus();
    }
  });

  // Navigating from the open menu: leave it open so the page cover closes over it,
  // then reset instantly once the new page is in (no flash of the faded old page).
  document.addEventListener("astro:after-swap", () => {
    if (!isOpen) return;
    isOpen = false;
    toggle.setAttribute("aria-expanded", "false");
    tl.pause(0);
    menu.hidden = true;
    lenis?.start();
  });
}
