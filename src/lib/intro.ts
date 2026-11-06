import { useSyncExternalStore } from "react";

/**
 * The opening splash plays first; the hero's own animations (headline, chat,
 * typed prompts) wait for it. Splash sets `data-intro` on <html> and fires
 * INTRO_EVENT when the page starts to appear.
 */
export const INTRO_EVENT = "ditto:intro";

export function isIntroDone() {
  return document.documentElement.hasAttribute("data-intro") || !document.querySelector("[data-splash]");
}

/** Runs `cb` once the page has been revealed (right away if it already has). Returns a cleanup. */
export function onIntro(cb: () => void): () => void {
  if (isIntroDone()) {
    cb();
    return () => {};
  }
  window.addEventListener(INTRO_EVENT, cb, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, cb);
}

const subscribe = (cb: () => void) => {
  window.addEventListener(INTRO_EVENT, cb);
  return () => window.removeEventListener(INTRO_EVENT, cb);
};

export function useIntroDone() {
  return useSyncExternalStore(subscribe, isIntroDone, () => false);
}
