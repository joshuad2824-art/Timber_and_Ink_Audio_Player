import styles from "./Backdrop.module.css";

type BackdropProps = {
  children: React.ReactNode;
  /** The lamplight washes. On everywhere; the prototype keeps it on a toggle. */
  lamplight?: boolean;
  /** The worn-desk pass. Same. */
  wear?: boolean;
};

/**
 * Every screen sits on this. Four inert layers over the night page — lamplight,
 * desk wear, grain, vignette — and then the content, above them all.
 *
 * The two texture layers are toggleable because the prototype exposes them as
 * switches; nothing in the app turns them off yet.
 */
export function Backdrop({
  children,
  lamplight = true,
  wear = true,
}: BackdropProps) {
  return (
    <div className={styles.root}>
      {lamplight && <div className={`${styles.layer} ${styles.lamplight}`} />}
      {wear && <div className={`${styles.layer} ${styles.wear}`} />}
      <div className={`${styles.layer} ${styles.grain}`} />
      <div className={`${styles.layer} ${styles.vignette}`} />
      {children}
    </div>
  );
}
