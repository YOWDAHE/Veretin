"use client";

import { useEffect, useMemo, useRef } from "react";
import { onIntro } from "@/lib/intro";
import styles from "./ScrambleText.module.css";

/**
 * Scripts Ditto translates between. Each takes one of the four palette
 * colours (teal, violet, pink, orange) so a swapped
 * letter reads as "this bit is now Korean / Hindi / Arabic…".
 * Only standalone characters (no combining marks) so each renders on its own.
 */
export const SCRIPTS = [
  {
    name: "한국어",
    color: "#8b6cff",
    chars: "가나다라마바사아자차카타파하한글말소리",
  },
  { name: "中文", color: "#ff5a2c", chars: "语言声音世界你好說話翻愛海光" },
  {
    name: "日本語",
    color: "#e8559a",
    chars: "あいうえおかきくけこアイウエオカキク",
  },
  { name: "हिन्दी", color: "#0ea5a4", chars: "कखगघचजटडतदनपबमयरलवशसह" },
  { name: "العربية", color: "#e8559a", chars: "ابتجحدرسشصطعغفقكلمنهوي" },
  { name: "Русский", color: "#8b6cff", chars: "БГДЖЗИЛПФЦЧШЩЫЭЮЯ" },
  { name: "Ελληνικά", color: "#0ea5a4", chars: "ΓΔΘΛΞΠΣΦΨΩβγδλμπσφψω" },
  { name: "ไทย", color: "#ff5a2c", chars: "กขคงจฉชซดตถทนบปผพฟมยรลวสหอฮ" },
  { name: "አማርኛ", color: "#0ea5a4", chars: "ሀለሐመሠረሰሸቀበተቸነአከወዘየደገጠጨጸፈፐ" },
].map((s) => ({ ...s, glyphs: Array.from(s.chars) }));

export const SCRIPT_EVENT = "ditto:script";

const pick = <T,>(arr: readonly T[]) => arr[(Math.random() * arr.length) | 0];

// Spring tuning. Low damping ratio = visible overshoot ("bouncy").
const PUSH = { k: 520, c: 19 }; // sideways push of neighbours
const POP = { k: 760, c: 17 }; // scale pop of the swapped letter itself
const ENTER_DELAY = 35; // ms, scaled by distance from the cursor
const LEAVE_DELAY = 45; // ms, plus a little random stagger
// Every so often one word replays the left-to-right sweep on its own.
const REPLAY_MIN = 20000; // ms
const REPLAY_JITTER = 10000; // ms, added at random

export type ScrambleSegment = { text: string; className?: string };

type Props = {
  /** Each inner array is one line; segments let parts of a line carry their own style. */
  lines: ScrambleSegment[][];
  className?: string;
  /** Hover radius as a multiple of the font size. */
  radius?: number;
  /**
   * Line indexes that get the character-scramble intro, typed in left to right.
   * Other lines simply rise in word by word. Defaults to every line.
   */
  scrambleLines?: number[];
  /** Word that now and then replays the scramble by itself (punctuation ignored). */
  replayWord?: string;
};

type Token =
  | { kind: "space"; text: string }
  | { kind: "word"; chars: { char: string; index: number }[] };

type Ch = {
  outer: HTMLSpanElement;
  inner: HTMLSpanElement;
  final: string;
  line: number;
  /** width of the English letter */
  w: number;
  /** width of whatever glyph is showing now */
  g: number;
  swapped: boolean;
  // intro
  startAt: number;
  lockAt: number;
  nextSwap: number;
  // hover scheduling
  swapAt: number;
  restoreAt: number;
  // springs
  x: number;
  vx: number;
  s: number;
  vs: number;
  // hit-test centre, relative to the heading
  cx: number;
  cy: number;
};

// Intro timing (ms).
const INTRO_START = 160; // scramble line starts while the plain line is still rising in
const INTRO_STEP = 55; // gap between consecutive letters starting
const INTRO_CYCLE = 280; // how long each letter cycles before landing

export function ScrambleText({
  lines,
  className,
  radius = 0.85,
  scrambleLines,
  replayWord,
}: Props) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const { structure, count, label } = useMemo(() => {
    let index = 0;
    const structure = lines.map((line) =>
      line.map((seg) => ({
        className: seg.className,
        tokens: seg.text
          .split(/(\s+)/)
          .filter(Boolean)
          .map<Token>((tok) =>
            /^\s+$/.test(tok)
              ? { kind: "space", text: tok }
              : {
                  kind: "word",
                  chars: Array.from(tok).map((char) => ({
                    char,
                    index: index++,
                  })),
                },
          ),
      })),
    );
    const label = lines.map((l) => l.map((s) => s.text).join("")).join(" ");
    return { structure, count: index, label };
  }, [lines]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chars: Ch[] = charRefs.current
      .slice(0, count)
      .filter((c): c is HTMLSpanElement => !!c)
      .map((outer) => ({
        outer,
        inner: outer.firstElementChild as HTMLSpanElement,
        final: outer.dataset.char ?? "",
        line: Number(outer.dataset.line),
        w: 0,
        g: 0,
        swapped: false,
        startAt: 0,
        lockAt: 0,
        nextSwap: 0,
        swapAt: Infinity,
        restoreAt: Infinity,
        x: 0,
        vx: 0,
        s: 1,
        vs: 0,
        cx: 0,
        cy: 0,
      }));
    const lineCount = chars.reduce((m, c) => Math.max(m, c.line + 1), 0);
    const scrambleSet = new Set(
      scrambleLines ?? Array.from({ length: lineCount }, (_, i) => i),
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let rootRect = root.getBoundingClientRect();
    let rectDirty = true;
    let R = 80;
    let px = 0;
    let py = 0;
    let hovering = false;
    let raf = 0;
    let last = 0;
    let disposed = false;

    // Swaps are written in one pass, then all new widths are read in one pass,
    // so a frame never forces more than one layout.
    const pendingWidth: Ch[] = [];

    const showGlyph = (c: Ch, kick: number) => {
      const script = pick(SCRIPTS);
      c.inner.textContent = pick(script.glyphs);
      c.inner.style.color = script.color;
      c.swapped = true;
      c.vs -= kick;
      pendingWidth.push(c);
      return script;
    };

    const showFinal = (c: Ch) => {
      c.inner.textContent = c.final;
      c.inner.style.color = "";
      c.swapped = false;
      c.g = c.w;
      c.vs -= 6;
    };

    const measure = () => {
      chars.forEach((c) => {
        c.inner.textContent = c.final;
        c.outer.style.transform = "";
      });
      rootRect = root.getBoundingClientRect();
      chars.forEach((c) => {
        const r = c.outer.getBoundingClientRect();
        c.w = c.outer.offsetWidth;
        c.cx = r.left - rootRect.left + r.width / 2;
        c.cy = r.top - rootRect.top + r.height / 2;
      });
      chars.forEach((c) => {
        c.outer.style.width = `${c.w}px`;
        if (c.swapped) {
          c.inner.textContent = pick(pick(SCRIPTS).glyphs);
          pendingWidth.push(c);
        } else c.g = c.w;
      });
      R = parseFloat(getComputedStyle(root).fontSize) * radius;
      rectDirty = false;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const r2 = R * R;
      let lastScript: (typeof SCRIPTS)[number] | null = null;

      // 1. Decide what each letter should show.
      for (const c of chars) {
        if (c.startAt) {
          if (now < c.startAt) continue; // not typed in yet
          c.startAt = 0;
          c.outer.style.opacity = "";
        }
        if (now < c.lockAt) {
          if (now >= c.nextSwap) {
            showGlyph(c, 4);
            c.nextSwap = now + 70 + Math.random() * 50;
          }
          continue;
        }
        if (c.lockAt) {
          // intro just finished for this letter
          if (c.swapped) showFinal(c);
          c.lockAt = 0;
          continue;
        }
        const d2 = (c.cx - px) ** 2 + (c.cy - py) ** 2;
        const inside = hovering && d2 < r2;
        if (inside) {
          c.restoreAt = Infinity;
          if (!c.swapped && c.swapAt === Infinity)
            c.swapAt = now + (Math.sqrt(d2) / R) * ENTER_DELAY;
          if (!c.swapped && now >= c.swapAt) {
            lastScript = showGlyph(c, 9);
            c.swapAt = Infinity;
          }
        } else {
          c.swapAt = Infinity;
          if (c.swapped && c.restoreAt === Infinity)
            c.restoreAt = now + LEAVE_DELAY + Math.random() * 55;
          if (c.swapped && now >= c.restoreAt) {
            showFinal(c);
            c.restoreAt = Infinity;
          }
        }
      }

      // 2. Read the natural width of any glyph swapped in this frame.
      if (pendingWidth.length) {
        for (const c of pendingWidth) c.g = c.inner.offsetWidth;
        pendingWidth.length = 0;
      }

      // 3. Each letter's target offset: everything that grew to its left pushes
      //    it right, and the whole line re-centres around the middle.
      const total = new Array<number>(lineCount).fill(0);
      for (const c of chars) total[c.line] += c.g - c.w;
      const run = new Array<number>(lineCount).fill(0);

      let moving = false;
      for (const c of chars) {
        const d = c.g - c.w;
        const target = run[c.line] + d / 2 - total[c.line] / 2;
        run[c.line] += d;

        c.vx += (-PUSH.k * (c.x - target) - PUSH.c * c.vx) * dt;
        c.x += c.vx * dt;
        c.vs += (-POP.k * (c.s - 1) - POP.c * c.vs) * dt;
        c.s += c.vs * dt;

        if (
          Math.abs(c.x - target) > 0.05 ||
          Math.abs(c.vx) > 0.05 ||
          Math.abs(c.s - 1) > 0.002 ||
          Math.abs(c.vs) > 0.01
        ) {
          moving = true;
        } else {
          c.x = target;
          c.vx = 0;
          c.s = 1;
          c.vs = 0;
        }
        c.outer.style.transform = c.x ? `translateX(${c.x.toFixed(2)}px)` : "";
        c.inner.style.transform = c.s !== 1 ? `scale(${c.s.toFixed(3)})` : "";
      }

      if (lastScript)
        window.dispatchEvent(
          new CustomEvent(SCRIPT_EVENT, {
            detail: { name: lastScript.name, color: lastScript.color },
          }),
        );

      const waiting = chars.some(
        (c) => c.startAt || c.lockAt || c.swapped || c.swapAt !== Infinity,
      );
      if (moving || hovering || waiting) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const start = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(tick);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hovering = true;
      onMove(e);
    };

    const onMove = (e: PointerEvent) => {
      if (!hovering) return;
      if (rectDirty) measure();
      px = e.clientX - rootRect.left;
      py = e.clientY - rootRect.top;
      start();
    };

    const onLeave = () => {
      hovering = false;
      start();
    };

    const markDirty = () => {
      rectDirty = true;
    };
    const introHost = root.closest<HTMLElement>("[data-intro-item]");

    // Letters of the replay word, found by grouping letters on their word element.
    const bare = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
    const byWord = new Map<Element | null, Ch[]>();
    for (const c of chars) {
      const w = c.outer.parentElement;
      byWord.set(w, [...(byWord.get(w) ?? []), c]);
    }
    const replayChars = replayWord
      ? ([...byWord.values()].find((cs) => bare(cs.map((c) => c.final).join("")) === bare(replayWord)) ?? [])
      : [];

    // Ambient replay: sweep the word left to right again, but only when
    // nobody is hovering, nothing is mid-animation and the headline is on screen.
    let replayTimer = 0;
    const replay = () => {
      const r = root.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < window.innerHeight;
      const busy = hovering || chars.some((c) => c.startAt || c.lockAt || c.swapped);
      if (document.hidden || !onScreen || busy) return;
      const t0 = performance.now();
      replayChars.forEach((c, k) => {
        if (!/\p{L}/u.test(c.final)) return; // leave punctuation alone
        c.nextSwap = t0 + k * INTRO_STEP;
        c.lockAt = c.nextSwap + INTRO_CYCLE + Math.random() * 80;
      });
      start();
    };
    const scheduleReplay = () => {
      replayTimer = window.setTimeout(() => {
        if (disposed) return;
        replay();
        if (replayChars.length) scheduleReplay();
      }, REPLAY_MIN + Math.random() * REPLAY_JITTER);
    };

    let resizeFrame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        measure();
        start();
      });
    });

    // Waits for the opening splash, then for fonts, so the intro is seen.
    const offIntro = onIntro(() =>
      document.fonts.ready.then(() => {
        if (disposed) return;
        measure();
        root.dataset.ready = "";
        if (reduceMotion) return;

        // Intro: letters on the scramble lines appear one at a time, left to
        // right, each cycling through other scripts briefly before landing.
        const t0 = performance.now();
        let k = 0;
        for (const c of chars) {
          if (!scrambleSet.has(c.line)) continue;
          c.startAt = t0 + INTRO_START + k * INTRO_STEP;
          c.lockAt = c.startAt + INTRO_CYCLE + Math.random() * 80;
          c.outer.style.opacity = "0";
          k++;
        }
        start();

        root.addEventListener("pointerenter", onEnter);
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        window.addEventListener("scroll", markDirty, { passive: true });
        // The page-reveal animation scales this block up from the centre, so the
        // letter positions measured above are off until it finishes: re-measure then.
        introHost?.addEventListener("animationend", markDirty);
        ro.observe(root);
        if (replayChars.length) scheduleReplay();
      }),
    );

    return () => {
      disposed = true;
      offIntro();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeFrame);
      ro.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", markDirty);
      introHost?.removeEventListener("animationend", markDirty);
      window.clearTimeout(replayTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intro runs once; the line list is static
  }, [count, radius]);

  return (
    <h1
      ref={rootRef}
      className={`${styles.root} ${className ?? ""}`}
      aria-label={label}
    >
      <span className={styles.text} aria-hidden="true">
        {structure.map((line, li) => {
          const plain = scrambleLines ? !scrambleLines.includes(li) : false;
          let wi = 0;
          return (
            <span
              key={li}
              className={styles.line}
              data-plain={plain || undefined}
            >
              {line.map((seg, si) => (
                <span key={si} className={seg.className}>
                  {seg.tokens.map((tok, ti) =>
                    tok.kind === "space" ? (
                      tok.text
                    ) : (
                      <span
                        key={ti}
                        className={styles.word}
                        style={{ "--wi": wi++ } as React.CSSProperties}
                      >
                        {tok.chars.map(({ char, index }) => (
                          <span
                            key={index}
                            ref={(el) => {
                              charRefs.current[index] = el;
                            }}
                            className={styles.ch}
                            data-char={char}
                            data-line={li}
                          >
                            <span className={styles.glyph}>{char}</span>
                          </span>
                        ))}
                      </span>
                    ),
                  )}
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
