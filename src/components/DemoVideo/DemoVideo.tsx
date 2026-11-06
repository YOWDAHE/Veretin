"use client";

import { useRef, useState } from "react";
import styles from "./DemoVideo.module.css";

/** Product video under the hero: plays muted on loop; hover shows a centred sound toggle. */
export function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    // Unmuting is a user gesture, so make sure it is actually playing too.
    if (v.paused) void v.play().catch(() => {});
  };

  return (
    <section className={styles.section} aria-label="Product video">
      <div className={styles.frame} data-muted={muted || undefined} data-demo-frame="">
        <video
          ref={ref}
          className={styles.video}
          src="/demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <button type="button" className={styles.sound} onClick={toggle} aria-pressed={!muted}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M3.5 7.5h2.6L10 4.2v11.6l-3.9-3.3H3.5a.8.8 0 0 1-.8-.8V8.3a.8.8 0 0 1 .8-.8Z"
              fill="currentColor"
            />
            {muted ? (
              <path d="m13 7.5 5 5m0-5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path
                d="M13 7.2a4 4 0 0 1 0 5.6M15.4 5a7.2 7.2 0 0 1 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </section>
  );
}
