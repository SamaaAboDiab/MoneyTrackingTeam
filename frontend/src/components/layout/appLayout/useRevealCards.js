import { useEffect } from "react";

// What counts as a "card" across the app's pages (shared Tailwind card styling).
const CARD_SELECTOR = 'section, article, [class*="ring-slate-100"], [class*="rounded-3xl"]';
// Never animate modals, dropdowns or loading placeholders.
const SKIP_SELECTOR = '.fixed, [role="dialog"], [role="status"]';
const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 6;

/*
  Fades cards in (with a slight rise) as they enter the viewport. Cards visible on arrival
  appear one after another; cards further down reveal while scrolling; cards that render
  later (data arriving after skeletons) reveal too. Only outermost cards animate, and the
  helper classes are removed once the transition ends so cards keep their own transitions.
*/
function useRevealCards(containerRef, key) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timers = new Set();

    const finish = (el) => {
      if (!el.classList.contains("reveal")) return;
      el.classList.remove("reveal", "is-visible");
      el.style.removeProperty("--reveal-delay");
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((entry, index) => {
            const el = entry.target;
            io.unobserve(el);
            const delay = Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS;
            el.style.setProperty("--reveal-delay", `${delay}ms`);
            el.classList.add("is-visible");
            el.addEventListener("transitionend", () => finish(el), { once: true });
            const timer = setTimeout(() => finish(el), delay + 900); // fallback if transitionend never fires
            timers.add(timer);
          });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    const seen = new WeakSet();
    const scan = () => {
      root.querySelectorAll(CARD_SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.closest(SKIP_SELECTOR)) return;
        const outer = el.parentElement?.closest(CARD_SELECTOR);
        if (outer && root.contains(outer)) return; // its parent card animates it
        el.classList.add("reveal");
        io.observe(el);
      });
    };

    scan();
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      root.querySelectorAll(".reveal").forEach(finish);
    };
  }, [containerRef, key]);
}

export default useRevealCards;
