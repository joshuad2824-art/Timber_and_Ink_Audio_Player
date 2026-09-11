import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule, PaperCard } from "@/ui/devices";
import styles from "../screens.module.css";
import gate from "../r/[slug]/gate.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The way in to the desk. Signed in, this route is the desk itself; signed
 * out, it is this card.
 *
 * The gate's twin, tipped the other way. Milestone 4 gives it a real password
 * and takes the on-screen hint out for good.
 */
export default function AdminPage() {
  return (
    <Backdrop>
      <section className={styles.centered}>
        <div className={styles.columnAdmin}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            All recordings
          </Link>

          <KeyCap className={gate.eyebrow}>Behind the counter</KeyCap>
          <h1 className={type_.albumTitle}>Sign in</h1>
          <PairedRule />
          <p className={`${type_.hand} ${gate.line}`}>
            This part is mine. Everything behind it changes what other people
            see.
          </p>

          <PaperCard
            className={gate.card}
            rotate={0.8}
            tape={{ placement: "topRight", tone: "olive" }}
          >
            <div className={gate.label}>The key</div>
            <div className={gate.field} />
            <div className={gate.errorSlot} />
            <div className={gate.button}>Sign in</div>
          </PaperCard>

          <p className={styles.pending}>The desk opens in milestone 4.</p>
        </div>
      </section>
    </Backdrop>
  );
}
