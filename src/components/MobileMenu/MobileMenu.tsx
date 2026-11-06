"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MobileMenu.module.css";

type NavLink = { href: string; label: string };

/** Phone-size navigation: a round menu button that drops a sheet with staggered items. */
export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Close if the screen grows past the phone layout while open.
    const wide = window.matchMedia("(min-width: 721px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);
  let i = 0;

  return (
    <div className={styles.root} data-open={open || undefined}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.bars} aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      <div className={styles.backdrop} onClick={close} aria-hidden="true" />

      <div id="mobile-menu" className={styles.sheet} role="dialog" aria-modal="true" aria-label="Menu">
        <nav aria-label="Main">
          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.href} style={{ "--i": i++ } as React.CSSProperties}>
                <a href={l.href} onClick={close}>
                  {l.label}
                  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <a href="/login" className={styles.login} onClick={close} style={{ "--i": i++ } as React.CSSProperties}>
            Log in
          </a>
          <a href="/download" className={styles.download} onClick={close} style={{ "--i": i++ } as React.CSSProperties}>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
