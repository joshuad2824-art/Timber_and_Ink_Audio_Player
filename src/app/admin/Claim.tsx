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
 * Claiming the desk, once, on a site that has never had an owner.
 *
 * Shown only while no credential exists. The setup token lives in the project's
 * environment variables and nowhere else — not in this repository, not in a
 * message — so the person who deploys the site is the person who can claim it.
 */
export function Claim() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nudge, setNudge] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    if (!token) return setNudge("I'll need the setup token first.");
    if (password.length < 12) return setNudge("Make the key at least 12 characters.");
    if (password !== confirm) return setNudge("The two keys don't match.");

    setBusy(true);
    setNudge("");
    try {
      const res = await fetch("/api/admin/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setNudge(typeof body?.error === "string" ? body.error : "That didn't work.");
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

        <KeyCap className={gate.eyebrow}>Nobody's here yet</KeyCap>
        <h1 className={type_.albumTitle}>Claim the desk</h1>
        <PairedRule />
        <p className={`${type_.hand} ${gate.line}`}>
          No one owns this yet. The setup token is in the site&rsquo;s
          environment variables — paste it once, pick a key, and the desk is
          yours.
        </p>

        <PaperCard
          className={gate.card}
          rotate={0.8}
          tape={{ placement: "topRight", tone: "olive" }}
        >
          <label className={gate.label} htmlFor="token">
            Setup token
          </label>
          <input
            id="token"
            className={gate.input}
            type="password"
            value={token}
            autoComplete="off"
            onChange={(e) => setToken(e.target.value)}
          />

          <div style={{ height: 16 }} />

          <label className={gate.label} htmlFor="new-key">
            A new key
          </label>
          <input
            id="new-key"
            className={gate.input}
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ height: 16 }} />

          <label className={gate.label} htmlFor="confirm-key">
            The same key again
          </label>
          <input
            id="confirm-key"
            className={gate.input}
            type="password"
            value={confirm}
            autoComplete="new-password"
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          />

          <div className={gate.errorSlot} role="status" aria-live="polite">
            {nudge}
          </div>
          <button
            type="button"
            className={gate.button}
            disabled={busy}
            onClick={() => void submit()}
          >
            Claim it
          </button>
        </PaperCard>
      </div>
    </section>
  );
}
