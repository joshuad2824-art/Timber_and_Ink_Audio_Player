import Link from "next/link";

import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule } from "@/ui/devices";
import styles from "./screens.module.css";
import type_ from "@/ui/type.module.css";

/* A record that is a draft, or was never here, reads the same from outside.
   That is deliberate: the 404 must not tell anyone a draft exists. */
export default function NotFound() {
  return (
    <Backdrop>
      <section className={styles.centered}>
        <div className={styles.column}>
          <KeyCap>Nothing here</KeyCap>
          <h1 className={type_.pageTitle}>Not found</h1>
          <PairedRule />
          <p className={type_.hand}>
            There&rsquo;s no record at this address. Check the link I sent you,
            or start from the catalog.
          </p>
          <Link href="/" className={styles.backLink}>
            All recordings
          </Link>
        </div>
      </section>
    </Backdrop>
  );
}
