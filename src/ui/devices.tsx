import styles from "./devices.module.css";

/* The recurring decorative devices, built once. Their recipes are in
   devices.module.css; nothing else in the app should reproduce them. */

type Rotation = { rotate?: number };

/** The eyebrow label above a page title. A typewriter key on the desk. */
export function KeyCap({
  children,
  rotate = -1.2,
  className,
}: { children: React.ReactNode; className?: string } & Rotation) {
  return (
    <div
      className={[styles.keyCap, className].filter(Boolean).join(" ")}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}

/**
 * A status chip stamped into the dark page. The ink carries the meaning —
 * brass for open, sage for locked, amber for draft — so callers pass it.
 */
export function PressedPlate({
  children,
  tone,
  rotate = -1.4,
}: { children: React.ReactNode; tone: string } & Rotation) {
  return (
    <span
      className={styles.pressedPlate}
      style={{ color: tone, transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

export type TapePlacement =
  | "topLeft"
  | "topLeftWide"
  | "topRight"
  | "bottomRight";

const placementClass: Record<TapePlacement, string> = {
  topLeft: styles.tapeTopLeft,
  topLeftWide: styles.tapeTopLeftWide,
  topRight: styles.tapeTopRight,
  bottomRight: styles.tapeBottomRight,
};

/**
 * A strip of cloth tape holding down a corner. Purely decorative, so it is
 * hidden from assistive tech. The parent must be positioned.
 */
export function Tape({
  placement,
  tone = "cream",
}: {
  placement: TapePlacement;
  tone?: "cream" | "olive";
}) {
  return (
    <div
      aria-hidden="true"
      className={[
        styles.tape,
        tone === "olive" ? styles.tapeOlive : styles.tapeCream,
        placementClass[placement],
      ].join(" ")}
    />
  );
}

/** The masthead break: a 2px cream rule with a faint echo under it. */
export function PairedRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[styles.pairedRule, className].filter(Boolean).join(" ")}
    >
      <div className={styles.ruleHeavy} />
      <div className={styles.ruleLight} />
    </div>
  );
}

/**
 * Printed matter set into the night page — the two sign-in cards. The
 * data-stock attribute flips the design system to its daylight values for
 * everything inside, so ink, borders and shadows all follow without help.
 */
export function PaperCard({
  children,
  rotate = -0.7,
  tape,
  className,
}: {
  children: React.ReactNode;
  tape?: { placement: TapePlacement; tone?: "cream" | "olive" };
  className?: string;
} & Rotation) {
  return (
    <div
      className={[styles.paperWrap, className].filter(Boolean).join(" ")}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div data-stock="paper" className={styles.paper}>
        {children}
      </div>
      {tape && <Tape placement={tape.placement} tone={tape.tone} />}
    </div>
  );
}

/**
 * Cover art in a cream mat. The bottom border is cut deeper than the sides,
 * the way a real mount is. Two tape strips hold it to the page.
 */
export function PhotoMat({
  src,
  alt,
  rotate = -1.3,
  caption,
}: {
  src?: string;
  alt: string;
  caption?: React.ReactNode;
} & Rotation) {
  return (
    <div className={styles.matWrap} style={{ transform: `rotate(${rotate}deg)` }}>
      <div className={styles.mat}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.matImage} src={src} alt={alt} />
        {caption}
      </div>
      <Tape placement="topLeftWide" tone="olive" />
      <Tape placement="bottomRight" tone="cream" />
    </div>
  );
}
