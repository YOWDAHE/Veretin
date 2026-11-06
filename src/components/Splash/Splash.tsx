"use client";

import { useEffect, useState } from "react";
import { INTRO_EVENT } from "@/lib/intro";
import styles from "./Splash.module.css";

// "Ditto" written in the scripts it translates between, landing on English.
const WORDS = [
  { text: "Дитто", lang: "ru" },
  { text: "ディットー", lang: "ja" },
  { text: "디토", lang: "ko" },
  { text: "डिट्टो", lang: "hi" },
  { text: "ديتو", lang: "ar" },
  { text: "Ντίτο", lang: "el" },
  { text: "ดิตโต้", lang: "th" },
  { text: "迪托", lang: "zh" },
  { text: "ዲቶ", lang: "am" },
  { text: "Ditto", lang: "en" },
];
const COLORS = ["var(--ink)", "var(--violet)", "var(--pink)", "var(--teal)", "var(--orange)"];

const FIRST = 420; // the opening word gets a little longer than the rest
const STEP = 240; // ms per translated word
const HOLD = 1200; // on the final "Ditto" before it fades and the page grows out
const BG_DELAY = 650; // backdrop fades in after the content has started to appear
const FADE = 800; // splash and word fade-out

/** White opening screen: one small word cycling through languages, then the page grows out of it. */
export function Splash() {
  const [i, setI] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const last = WORDS.length - 1;
    if (!reduce) for (let k = 1; k <= last; k++) at(FIRST + (k - 1) * STEP, () => setI(k));

    const reveal = reduce ? 800 : FIRST + (last - 1) * STEP + HOLD;
    at(reveal, () => {
      // Each piece grows out of the screen's centre, where the word sat.
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      document.querySelectorAll<HTMLElement>("[data-intro-item]").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.transformOrigin = `${cx - r.left}px ${cy - r.top}px`;
      });
      root.setAttribute("data-intro", "");
      window.dispatchEvent(new Event(INTRO_EVENT));
    });
    at(reveal + BG_DELAY, () => root.setAttribute("data-intro-bg", ""));
    at(reveal + FADE, () => setGone(true));
    at(reveal + 1600, () =>
      document.querySelectorAll<HTMLElement>("[data-intro-item]").forEach((el) => (el.style.transformOrigin = "")),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  if (gone) return null;
  const w = WORDS[i];

  return (
    <div className={styles.splash} data-splash="" aria-hidden="true">
      <span
        key={i}
        lang={w.lang}
        className={i === WORDS.length - 1 ? `${styles.word} ${styles.brand}` : styles.word}
        style={i === WORDS.length - 1 ? undefined : { color: COLORS[i % COLORS.length] }}
      >
        {w.text}
      </span>
    </div>
  );
}
