import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export function useFadeUp(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 700,
      ease: "outExpo",
    });
  }, deps);
  return ref;
}

export function useStaggerChildren(selector, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll(selector);
    if (items.length === 0) return;
    animate(items, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(70),
      ease: "outQuad",
    });
  }, deps);
  return ref;
}

export function useScaleIn(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      scale: [0.94, 1],
      opacity: [0, 1],
      duration: 600,
      ease: "outBack",
    });
  }, deps);
  return ref;
}

export function useSlideIn(direction = "left", deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const offset = direction === "left" ? -40 : direction === "right" ? 40 : 0;
    const offsetY = direction === "up" ? -40 : direction === "down" ? 40 : 0;
    animate(ref.current, {
      translateX: offset !== 0 ? [offset, 0] : 0,
      translateY: offsetY !== 0 ? [offsetY, 0] : 0,
      opacity: [0, 1],
      duration: 700,
      ease: "outExpo",
    });
  }, deps);
  return ref;
}
