import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu/MobileMenu";
import styles from "./SiteHeader.module.css";

const links = [
  { href: "#product", label: "Product", menu: true },
  { href: "#languages", label: "Languages", menu: false },
  { href: "/pricing", label: "Pricing", menu: false },
];

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 8 8" aria-hidden="true">
    <path d="M1.5 3 4 5.5 6.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner} data-intro-item="" style={{ "--intro-i": 0 } as React.CSSProperties}>
        <Link href="/" className={styles.brand} aria-label="Ditto home">
          <svg width="26" height="26" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v4A2.5 2.5 0 0 1 11.5 11H7l-3 2.5V11h0A2.5 2.5 0 0 1 2 8.5Z" fill="var(--ink)" />
            <path d="M20 13.5A2.5 2.5 0 0 0 17.5 11h-7A2.5 2.5 0 0 0 8 13.5v4a2.5 2.5 0 0 0 2.5 2.5H15l3 2v-2h0a2.5 2.5 0 0 0 2-2.5Z" fill="var(--violet)" />
          </svg>
          <span>Ditto</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={styles.pill}>
              {l.label}
              {l.menu && (
                <span className={styles.chev}>
                  <Chevron />
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className={styles.right}>
          <a href="/login" className={`${styles.pill} ${styles.login}`}>
            <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true">
              <circle cx="6" cy="3.8" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.8 11c.4-2.2 2.1-3.4 4.2-3.4s3.8 1.2 4.2 3.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Log in
          </a>
          <a href="/download" className={`${styles.pill} ${styles.download}`}>
            Download
          </a>
        </div>

        <MobileMenu links={links} />
      </div>
    </header>
  );
}
