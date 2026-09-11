"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PaperCard } from "@/ui/devices";
import { PHRASE_EMPTY } from "@/data/phrase";
import gate from "./gate.module.css";

/**
 * The phrase card.
 *
 * The phrase goes to the server and the answer comes back from the server —
 * nothing here knows what the phrase is, and nothing here decides whether it
 * was right. On success the record's page is re-requested, and it comes back
 * as the album because the cookie is now set. The tracks arrive rendered, not
 * as data this component fetched.
 */
export function GateForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const [nudge, setNudge] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;

    // The empty case is answered here rather than spent on a round trip; the
    // wording matches what the server would have said.
    if (!phrase.trim()) {
      setNudge(PHRASE_EMPTY);
      return;
    }

    setBusy(true);
    setNudge("");

    try {
      const res = await fetch(`/api/records/${slug}/unlock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phrase }),
      });

      if (res.ok) {
        router.refresh();
        return;
      }

      const body = await res.json().catch(() => ({}));
      setNudge(
        typeof body?.error === "string"
          ? body.error
          : "Something went wrong on my end. Try again in a moment.",
      );
    } catch {
      setNudge("I couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PaperCard className={gate.card} tape={{ placement: "topLeft", tone: "cream" }}>
      <label className={gate.label} htmlFor="phrase">
        The phrase
      </label>

      <input
        id="phrase"
        className={gate.input}
        type="text"
        value={phrase}
        placeholder="the phrase"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Access phrase"
        aria-invalid={nudge ? true : undefined}
        aria-describedby="phrase-nudge"
        onChange={(e) => setPhrase(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
        }}
      />

      {/* Keeps its height when empty, so the card never reflows under the
          reader's hands as an error appears or clears. */}
      <div id="phrase-nudge" className={gate.errorSlot} role="status" aria-live="polite">
        {nudge}
      </div>

      <button
        type="button"
        className={gate.button}
        onClick={() => void submit()}
        disabled={busy}
      >
        Come in
      </button>
    </PaperCard>
  );
}
