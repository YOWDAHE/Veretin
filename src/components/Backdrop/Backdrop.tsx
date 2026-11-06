import styles from "./Backdrop.module.css";

/**
 * Warm colour blobs drifting slowly, seen through a frosted, grainy pane.
 * Purely decorative and sits behind whatever its parent contains.
 */
export function Backdrop() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.blobs}>
        <i className={styles.b1} />
        <i className={styles.b2} />
        <i className={styles.b3} />
        <i className={styles.b4} />
        <i className={styles.b5} />
      </div>
      <div className={styles.glass} />
    </div>
  );
}
