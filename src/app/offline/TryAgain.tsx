"use client";

import styles from "./offline.module.css";

/**
 * A reload, because the ordinary way back is a link and every link from here
 * goes to a page that isn't there. Client-side because the whole gesture is
 * "ask again from where I'm standing".
 */
export function TryAgain() {
  return (
    <button
      type="button"
      className={styles.again}
      onClick={() => window.location.reload()}
    >
      Try again
    </button>
  );
}
