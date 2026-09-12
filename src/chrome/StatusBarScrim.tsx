import styles from "./StatusBarScrim.module.css";

/**
 * The opaque strip the iOS status bar sits on.
 *
 * Rendered in the layout rather than inside Backdrop, and that is deliberate:
 * it belongs to the app shell rather than to any screen, and a fixed element
 * nested inside a container that clips its overflow is one stacking-context
 * change away from being clipped with it. At the top of the body it cannot be.
 *
 * Decorative and inert — it has nothing to say to a screen reader and must
 * never take a tap that was meant for whatever is underneath it.
 */
export function StatusBarScrim() {
  return <div className={styles.scrim} aria-hidden="true" />;
}
