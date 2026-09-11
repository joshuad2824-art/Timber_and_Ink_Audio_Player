import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule } from "@/ui/devices";
import { getAvailableFormats, getGateRecord, getUnlockedRecord } from "@/data/catalog";
import { isAdmin } from "@/data/admin";
import { AdminBar } from "@/chrome/AdminBar";
import { GateForm } from "./GateForm";
import { Album } from "./Album";
import styles from "../../screens.module.css";
import gate from "./gate.module.css";
import type_ from "@/ui/type.module.css";

export const dynamic = "force-dynamic";

/**
 * One record — the gate and the album both, chosen here on the server.
 *
 * This is the whole security model in one branch. A locked record never gets
 * as far as loading tracks, so there is no payload to strip and nothing to
 * leak: the gate branch simply has no track data in scope.
 */
export default async function RecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Returns null for a locked record and for one that does not exist alike.
  const record = await getUnlockedRecord(slug);
  if (record) {
    /* Which tracks actually have a streamable encoding. Resolved here so the
       list can show the difference between a track that is silent and one that
       is simply not up yet, without the client asking. */
    const formats = await getAvailableFormats(slug);
    const playable = Object.keys(formats).filter((id) => formats[id].includes("flac"));
    return <Album record={record} playable={playable} admin={await isAdmin()} />;
  }

  // Not unlocked. Drafts are invisible here too, so a 404 cannot be used to
  // discover that a draft exists.
  const summary = await getGateRecord(slug);
  if (!summary) notFound();

  return (
    <Backdrop>
      {(await isAdmin()) && <AdminBar note="Phrases don't stop you here" />}
      <section className={styles.centered}>
        <div className={styles.column}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            All recordings
          </Link>

          <KeyCap className={gate.eyebrow}>By invitation</KeyCap>
          <h1 className={type_.gateTitle}>{summary.artistName}</h1>
          <PairedRule />
          <p className={`${type_.hand} ${gate.line}`}>
            The phrase I sent you opens {summary.albumTitle} and nothing else.
            Once you&rsquo;re through, it stays open on this device.
          </p>

          <GateForm slug={slug} />
        </div>
      </section>
    </Backdrop>
  );
}
