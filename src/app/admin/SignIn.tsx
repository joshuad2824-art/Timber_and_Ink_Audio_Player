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
      if (typeof body?.error === "string") {
        setNudge(body.error);
        return;
      }
      /* No error field means the server didn't answer in the shape it promised
         — a crash, a proxy page, a timeout. Blaming the key would be a lie, and
         an expensive one: it sends you off checking something that was right
         all along. */
      setNudge(
        res.status >= 500
          ? "Something went wrong on my end, not with what you typed."
          : "That isn't the key.",
      );
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
          {/* A real form, so a password manager recognises this as a sign-in
              and offers to fill it — and so the return key submits without an
              input having to listen for it. */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
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
            />
            <div id="key-nudge" className={gate.errorSlot} role="alert">
              {nudge}
            </div>
            <button type="submit" className={gate.button} disabled={busy}>
              Sign in
            </button>
          </form>
        </PaperCard>
      </div>
    </section>
  );
}
