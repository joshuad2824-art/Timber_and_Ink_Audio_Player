"use client";

import { useEffect, useState } from "react";

import type { DiagnosticEntry, PlayerEngine } from "./engine";
import styles from "./DiagnosticLog.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The engine's own notes, shown only at `#log`.
 *
 * For one job: finding out, on a real phone, why a record stopped between two
 * tracks. A locked iPhone that waits for the screen can mean the track's end
 * was never reported, the next file was refused, or it started and the phone
 * then stopped it — and each of those wants a different fix. The engine
 * writes down which; this puts it where the person holding the phone can read
 * it, and copy it, without a Mac and a cable.
 *
 * Nothing leaves the device. There is no endpoint, no storage, nothing sent;
 * the notes live in the engine's memory and go when the page does. Adding
 * `#log` to the address of a record that is already playing changes the hash
 * and not the page, so the notes taken while the phone was locked are still
 * there to read.
 */
export function DiagnosticLog({ engine }: { engine: PlayerEngine }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<DiagnosticEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const read = () => setOpen(window.location.hash === "#log");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  useEffect(() => {
    if (!open) return;
    const read = () => setEntries(engine.diagnostics());
    read();
    const t = setInterval(read, 1000);
    return () => clearInterval(t);
  }, [open, engine]);

  if (!open) return null;

  const text = [header(), ...entries.map(line)].join("\n");

  return (
    <section className={styles.log} aria-label="Player notes">
      <div className={`${type_.meta} ${styles.heading}`}>Player notes</div>
      <pre className={styles.lines}>{text}</pre>
      <button
        type="button"
        className={styles.copy}
        onClick={() => {
          void navigator.clipboard?.writeText(text).then(() => setCopied(true));
        }}
      >
        {copied ? "Copied" : "Copy the notes"}
      </button>
    </section>
  );
}

function header(): string {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return [
    `build ${process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown"}`,
    standalone ? "home screen" : "browser tab",
    navigator.userAgent,
  ].join(" · ");
}

function line(e: DiagnosticEntry): string {
  const at = new Date(e.at);
  const time = [at.getHours(), at.getMinutes(), at.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  const ms = String(at.getMilliseconds()).padStart(3, "0");
  return `${time}.${ms}  #${e.index + 1}  ${e.event}${e.detail ? `  ${e.detail}` : ""}`;
}
