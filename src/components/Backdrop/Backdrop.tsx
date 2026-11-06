"use client";

import { useEffect, useRef } from "react";
import styles from "./Backdrop.module.css";

/**
 * Where each blob sits at the top of the page (same as the original CSS layout:
 * measured from the top, or up from the bottom of the first screen), and its
 * colour. Listed left to right, which is also their order in the row.
 */
const BLOBS = [
  { c: "#ff6a2b", size: 46, x: -10, y: { vw: -14 } },
  { c: "#ff8a5b", size: 30, x: 4, y: { fromBottomVh: 4 } },
  { c: "#ffc21a", size: 34, x: 30, y: { vh: 18 } },
  { c: "#ff7ac0", size: 28, x: 66, y: { fromBottomVh: 8 } },
  { c: "#ff4f9a", size: 40, x: 68, y: { vw: -6 } },
] as const;

const TOP_CUT = 0.25; // upper frosted pane ends a quarter of the way into the video
const BOTTOM_CUT = 1; // lower frosted pane starts at the bottom of the video
const ROW_OVERLAP = 1.25; // each blob in the row is this much wider than its slot
const SCATTER = 0.5; // screens of scrolling over which the row breaks up again

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => n * n * (3 - 2 * n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Warm blobs behind frosted, grainy panes; they only move with scroll.
 *
 * 1. Scattered at the top of the page, seen through the upper pane.
 * 2. Scrolling down, they glide into one row across the middle of the screen,
 *    landing just as the upper pane's scalloped edge clears them, so they show raw
 *    beside the video.
 * 3. The row then holds still mid-screen while the video scrolls past.
 * 4. The lower pane (which picks up again at the bottom of the video) rises over
 *    them; then they scatter back to their places and soften behind it.
 */
export function Backdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!root || !top || !bottom) return;

    type Box = { x: number; y: number; d: number };
    let home: Box[] = []; // page positions at the top (also where they return to, on screen)
    let row: Box[] = []; // screen positions in the row
    let s1 = 1; // scroll where the row has formed
    let s2 = 1; // scroll where the lower pane reaches the row
    let s3 = 1; // scroll where they are back in place
    let frame = 0;

    const layout = () => {
      const vw = window.innerWidth / 100;
      const vh = window.innerHeight / 100;
      const r = root.getBoundingClientRect();
      const rootTop = r.top + window.scrollY;
      const W = r.width;
      const screenH = Math.max(window.innerHeight, 640);
      const phone = window.matchMedia("(max-width: 720px)").matches;

      const v = document.querySelector<HTMLElement>("[data-demo-frame]")?.getBoundingClientRect();
      const videoTop = v ? v.top + window.scrollY : rootTop + r.height;
      const videoH = v ? v.height : 0;
      const cut1 = videoTop + videoH * TOP_CUT; // page y
      const cut2 = videoTop + videoH * BOTTOM_CUT; // page y
      top.style.height = `${cut1 - rootTop}px`;
      bottom.style.top = `${cut2 - rootTop}px`;

      home = BLOBS.map((b) => {
        const d = (phone ? 80 : b.size) * vw;
        const y = "vw" in b.y ? b.y.vw * vw : "vh" in b.y ? b.y.vh * vh : screenH - b.y.fromBottomVh * vh - d;
        return { x: b.x * vw, y, d };
      });

      const slot = W / BLOBS.length;
      const d = slot * ROW_OVERLAP;
      const rowTop = window.innerHeight / 2 - d / 2;
      row = BLOBS.map((_, i) => ({ x: i * slot - (d - slot) / 2, y: rowTop, d }));

      s1 = Math.max(1, cut1 - rowTop); // upper edge passes the top of the row
      s2 = Math.max(s1, cut2 - rowTop); // lower pane has risen over the row
      s3 = s2 + window.innerHeight * SCATTER;
    };

    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      let crisp: number;
      blobRefs.current.forEach((el, i) => {
        if (!el || !home[i]) return;
        let b: Box;
        if (y <= s1) {
          // Gather: from their spots on the page (scrolling with it) into the row.
          const p = smooth(clamp01(y / s1));
          b = {
            x: lerp(home[i].x, row[i].x, p),
            y: lerp(home[i].y - y, row[i].y, p),
            d: lerp(home[i].d, row[i].d, p),
          };
        } else if (y <= s2) {
          b = row[i]; // hold mid-screen
        } else {
          // Scatter back to their spots, now on screen behind the lower pane.
          const q = smooth(clamp01((y - s2) / (s3 - s2)));
          b = {
            x: lerp(row[i].x, home[i].x, q),
            y: lerp(row[i].y, home[i].y, q),
            d: lerp(row[i].d, home[i].d, q),
          };
        }
        el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) scale(${(b.d / 100).toFixed(4)})`;
      });
      // Edge sharpness: soft when scattered, crisp while in the row.
      if (y <= s1) crisp = smooth(clamp01(y / s1 / 0.85));
      else if (y <= s2) crisp = 1;
      else crisp = 1 - smooth(clamp01((y - s2) / (s3 - s2)));
      root.style.setProperty("--s", crisp.toFixed(4));
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const relayout = () => {
      layout();
      cancelAnimationFrame(frame);
      paint();
    };

    relayout();
    const ro = new ResizeObserver(relayout);
    ro.observe(document.body);
    window.addEventListener("scroll", queue, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", queue);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div className={styles.blobs}>
        {BLOBS.map((b, i) => (
          <i
            key={i}
            ref={(el) => {
              blobRefs.current[i] = el;
            }}
            style={{ "--c": b.c } as React.CSSProperties}
          >
            <span />
          </i>
        ))}
      </div>
      <div ref={topRef} className={`${styles.glass} ${styles.top}`} />
      <div ref={bottomRef} className={`${styles.glass} ${styles.bottom}`} />
    </div>
  );
}
