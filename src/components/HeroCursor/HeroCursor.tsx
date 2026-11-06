"use client";

import { useEffect, useRef } from "react";
import { SCRIPT_EVENT } from "@/components/ScrambleText/ScrambleText";
import styles from "./HeroCursor.module.css";

/**
 * Replaces the native cursor inside its parent element with a larger pointer.
 * A tag pops out only while the cursor is swapping headline letters, naming
 * the language it just "spoke". Mouse and pen only.
 */
export function HeroCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const tag = tagRef.current;
    const host = el?.parentElement;
    if (!el || !tag || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    host.dataset.customCursor = "";
    let resetTimer = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.dataset.visible = "";
      const target = e.target as Element | null;
      if (target?.closest("input, select, textarea")) el.dataset.native = "";
      else delete el.dataset.native;
      const overLink = target?.closest("a, button");
      if (overLink) el.dataset.link = "";
      else delete el.dataset.link;
    };

    const onLeave = () => {
      delete el.dataset.visible;
    };

    const onScript = (e: Event) => {
      const { name, color } = (e as CustomEvent<{ name: string; color: string }>).detail;
      tag.textContent = name;
      tag.style.background = color;
      el.dataset.speaking = "";
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        delete el.dataset.speaking;
      }, 700);
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener(SCRIPT_EVENT, onScript);
    return () => {
      delete host.dataset.customCursor;
      window.clearTimeout(resetTimer);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener(SCRIPT_EVENT, onScript);
    };
  }, []);

  return (
    <div ref={ref} className={styles.cursor} aria-hidden="true">
      <svg className={styles.pointer} width="38" height="38" viewBox="0 0 24 24">
        <path
          d="M4.9 3.2c-1-.4-2 .6-1.6 1.6l5.8 14.6c.4 1.1 2 1.1 2.4 0l1.7-4.6c.2-.5.6-.9 1.1-1.1l4.6-1.7c1.1-.4 1.1-2 0-2.4Z"
          fill="var(--ink)"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span ref={tagRef} className={styles.tag} />
    </div>
  );
}
