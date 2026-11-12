import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global wheel inertia smoother for desktop browsers across all public pages.
 * Respects reduced-motion preferences, nested scrollable containers, custom
 * prevented wheel handlers (e.g., Portfolio card carousel), and admin/launching routes.
 */
export default function SmoothScrollController() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.toLowerCase();
    const isExcludedRoute =
      path.startsWith("/admin") ||
      path.startsWith("/superadmin") ||
      path.startsWith("/launching");

    if (isExcludedRoute) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isMobileOrTouch =
      typeof window !== "undefined" &&
      (window.innerWidth <= 768 || window.matchMedia("(pointer: coarse)").matches);
    if (isMobileOrTouch) return;

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let lastAppliedY = window.scrollY;
    let rafId: number | null = null;
    let lastTime = 0;
    let isAnimating = false;

    const stopAnimation = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      isAnimating = false;
      lastTime = 0;
      currentY = window.scrollY;
      targetY = window.scrollY;
      lastAppliedY = window.scrollY;
    };

    const getMaxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const findScrollableAncestor = (target: EventTarget | null, deltaY: number): boolean => {
      let node = target instanceof Element ? target : null;
      while (node && node !== document.body && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        const canScroll = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
        if (canScroll && node.scrollHeight > node.clientHeight + 1) {
          const atTop = node.scrollTop <= 0;
          const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
          if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
            return true;
          }
        }
        node = node.parentElement;
      }
      return false;
    };

    const step = (now: number) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const maxScroll = getMaxScroll();
      targetY = Math.max(0, Math.min(maxScroll, targetY));

      // Frame-rate-independent exponential smoothing (~90ms crisp response)
      const ease = 1 - Math.exp(-dt * 11.5);
      currentY += (targetY - currentY) * ease;

      const diff = Math.abs(targetY - currentY);
      const nextY = diff < 0.35 ? targetY : currentY;

      lastAppliedY = nextY;
      window.scrollTo({ top: nextY, left: window.scrollX, behavior: "instant" as ScrollBehavior });

      if (diff < 0.35) {
        currentY = targetY;
        rafId = null;
        isAnimating = false;
        lastTime = 0;
        return;
      }

      rafId = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaY) < 0.01) return;

      let deltaY = e.deltaY;
      if (e.deltaMode === 1) {
        deltaY *= 36;
      } else if (e.deltaMode === 2) {
        deltaY *= window.innerHeight * 0.85;
      }

      if (findScrollableAncestor(e.target, deltaY)) {
        return;
      }

      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) return;

      e.preventDefault();

      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = window.scrollY;
        lastAppliedY = window.scrollY;
        isAnimating = true;
        lastTime = 0;
      }

      targetY = Math.max(0, Math.min(maxScroll, targetY + deltaY));

      if (rafId === null) {
        rafId = requestAnimationFrame(step);
      }
    };

    const onScroll = () => {
      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = window.scrollY;
        lastAppliedY = window.scrollY;
        return;
      }
      if (Math.abs(window.scrollY - lastAppliedY) > 2.5) {
        // External scroll (e.g., anchor scrollIntoView or scrollbar jump) takes priority
        stopAnimation();
      }
    };

    const onPointerOrKeyInterrupt = (e: Event) => {
      if (e.type === "keydown") {
        const key = (e as KeyboardEvent).key;
        const isScrollKey =
          key === "ArrowUp" ||
          key === "ArrowDown" ||
          key === "PageUp" ||
          key === "PageDown" ||
          key === "Home" ||
          key === "End" ||
          key === " ";
        if (!isScrollKey) return;
      }
      if (isAnimating) {
        stopAnimation();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", stopAnimation, { passive: true });
    window.addEventListener("mousedown", onPointerOrKeyInterrupt, { passive: true });
    window.addEventListener("keydown", onPointerOrKeyInterrupt, { passive: true });

    return () => {
      stopAnimation();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", stopAnimation);
      window.removeEventListener("mousedown", onPointerOrKeyInterrupt);
      window.removeEventListener("keydown", onPointerOrKeyInterrupt);
    };
  }, [pathname]);

  return null;
}
