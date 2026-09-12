import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule } from "@/ui/devices";
import { TryAgain } from "./TryAgain";
import styles from "../screens.module.css";
import type_ from "@/ui/type.module.css";

/**
 * What the service worker serves for a page nobody has visited yet, with no
 * signal to fetch it.
 *
 * It exists to be a page rather than the browser's dinosaur, and to say the one
 * useful thing: kept tracks still play. Pre-cached on install, which is why it
 * is static — a page that needs the database cannot be the page you get when
 * there is no network.
 */
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <Backdrop>
      <section className={styles.centered}>
        <div className={styles.column}>
          <KeyCap>No signal</KeyCap>
          <h1 className={type_.gateTitle}>Nothing to reach</h1>
          <PairedRule />
          <p className={type_.hand}>
            I can&rsquo;t get to the catalog from here. Anything you kept on this
            device is still on it — open that record and it plays without me.
          </p>
          <TryAgain />
        </div>
      </section>
    </Backdrop>
  );
}
