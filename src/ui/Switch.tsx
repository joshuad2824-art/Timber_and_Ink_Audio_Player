import styles from "./Switch.module.css";

/**
 * The switch. One implementation, used everywhere the design asks for one.
 *
 * A bare <input type="checkbox"> paints itself in the browser's accent colour —
 * system blue, which is not a colour in this design system at all — so it is
 * kept for the accessibility tree and keyboard, and hidden behind a track and
 * knob that are.
 *
 * Engaged reads brass. Brass is metal: rules, marks, engaged controls. The
 * amber glow belongs to the play button and nothing else.
 */
export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <label className={styles.label}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
      <span className={styles.text}>{label}</span>
    </label>
  );
}
