import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule, PaperCard } from "@/ui/devices";
import { SEED_CATALOG } from "@/data/seed";
import styles from "../../screens.module.css";
import gate from "./gate.module.css";
import type_ from "@/ui/type.module.css";

/**
 * One record. This route is the gate and the album both: whether it renders
 * the phrase card or the player is decided server-side by the per-record
 * cookie, which is the whole point — a locked record's tracks and file URLs
 * never reach the client at all.
 *
 * Milestone 1 builds the gate's shell. The unlock endpoint lands in milestone
 * 2 and the player in milestone 3.
 */
export default async function RecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = SEED_CATALOG.find((r) => r.slug === slug);

  // A draft is unreachable even with the phrase, so it is a 404, not a gate.
  if (!record || !record.published) notFound();

  return (
    <Backdrop>
      <section className={styles.centered}>
        <div className={styles.column}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            All recordings
          </Link>

          <KeyCap className={gate.eyebrow}>By invitation</KeyCap>
          <h1 className={type_.gateTitle}>{record.artistName}</h1>
          <PairedRule />
          <p className={`${type_.hand} ${gate.line}`}>
            The phrase I sent you opens {record.albumTitle} and nothing else.
            Once you&rsquo;re through, it stays open on this device.
          </p>

          <PaperCard
            className={gate.card}
            tape={{ placement: "topLeft", tone: "cream" }}
          >
            <div className={gate.label}>The phrase</div>
            <div className={gate.field} />
            <div className={gate.errorSlot} />
            <div className={gate.button}>Come in</div>
          </PaperCard>

          <p className={styles.pending}>
            The gate opens in milestone 2.
          </p>
        </div>
      </section>
    </Backdrop>
  );
}
