"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { KeyCap, PairedRule, PaperCard } from "@/ui/devices";
import styles from "../screens.module.css";
import gate from "../r/[slug]/gate.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The gate's twin, tipped the other way.
 *
 * No hint line. The prototype printed the key on this screen; that was for
 * demonstrating the design and has no business on a real sign-in.
 */
export function SignIn() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [nudge, setNudge] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy || !password) {
      if (!password) setNudge("That isn't the key.");
      return;
    }
    setBusy(true);
    setNudge("");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setNudge(typeof body?.error === "string" ? body.error : "That isn't the key.");
    } catch {
      setNudge("I couldn't reach the server. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
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
          This part is mine. Everything behind it changes what other people see.
        </p>

        <PaperCard
          className={gate.card}
          rotate={0.8}
          tape={{ placement: "topRight", tone: "olive" }}
        >
          <label className={gate.label} htmlFor="key">
            The key
          </label>
          <input
            id="key"
            className={gate.input}
            type="password"
            value={password}
            autoComplete="current-password"
            aria-label="The key"
            aria-describedby="key-nudge"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          />
          <div id="key-nudge" className={gate.errorSlot} role="status" aria-live="polite">
            {nudge}
          </div>
          <button
            type="button"
            className={gate.button}
            disabled={busy}
            onClick={() => void submit()}
          >
            Sign in
          </button>
        </PaperCard>
      </div>
    </section>
  );
}
