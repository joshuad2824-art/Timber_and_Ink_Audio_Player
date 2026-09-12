"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { KeyCap, PairedRule, PressedPlate } from "@/ui/devices";
import { Switch } from "@/ui/Switch";
import { ToastSlot, useToast } from "@/chrome/Toast";
import { artistLine, recordMeta } from "@/data/phrase";
import type { AdminRecord } from "@/data/admin";
import type { SiteText } from "@/data/types";
import styles from "./desk.module.css";
import type_ from "@/ui/type.module.css";

type Tab = "catalog" | "siteText";

export function Desk({
  records: initialRecords,
  siteText: initialSiteText,
}: {
  records: AdminRecord[];
  siteText: SiteText;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("catalog");
  const [records, setRecords] = useState(initialRecords);
  const [toast, say] = useToast();

  useEffect(() => setRecords(initialRecords), [initialRecords]);

  async function refresh() {
    const res = await fetch("/api/admin/records");
    if (res.ok) setRecords((await res.json()).records);
    router.refresh();
  }

  /* Stable across renders, and that is not a tidiness point.

     This is a dependency of the site-text debounce below. Passed as a fresh
     arrow on every render it re-armed that effect every time anything in the
     desk re-rendered — including the toast this very callback's own save puts
     up — so each save scheduled the next one and the tab wrote to the database
     roughly once a second for as long as it was open. */
  const onSaved = useCallback(() => router.refresh(), [router]);

  const drafts = records.filter((r) => !r.published).length;
  const artists = artistLine(records.map((r) => r.artistName));
  const countLine = `${artists} · ${drafts} in drafts`;

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <a href="/" className={type_.metaSmall}>
          All recordings
        </a>
        <button
          type="button"
          className={styles.signOut}
          onClick={async () => {
            await fetch("/api/admin/session", { method: "DELETE" });
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>

      <KeyCap className={styles.eyebrow}>Behind the counter</KeyCap>
      <h1 className={type_.pageTitle}>The desk</h1>
      <PairedRule />
      <p className={type_.hand}>
        This is where the records get made. Nothing here is visible to anyone
        until you say so.
      </p>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "catalog"}
          className={`${styles.tab} ${tab === "catalog" ? styles.tabActive : ""}`}
          onClick={() => setTab("catalog")}
        >
          The catalog
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "siteText"}
          className={`${styles.tab} ${tab === "siteText" ? styles.tabActive : ""}`}
          onClick={() => setTab("siteText")}
        >
          Site text
        </button>
      </div>

      {tab === "catalog" ? (
        <>
          <div className={`${type_.meta} ${styles.count}`}>{countLine}</div>

          <div className={styles.cards}>
            {records.map((record, i) => (
              <RecordCard
                key={record.id}
                record={record}
                first={i === 0}
                last={i === records.length - 1}
                onChanged={refresh}
                say={say}
              />
            ))}
          </div>

          {records.length === 0 && (
            <div className={styles.empty}>Nothing here yet. Plenty of time.</div>
          )}

          <div className={styles.addRow}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={async () => {
                const res = await fetch("/api/admin/records", { method: "POST" });
                if (!res.ok) return;
                const { id } = await res.json();
                router.push(`/admin/${id}`);
              }}
            >
              Add an artist
            </button>
          </div>
        </>
      ) : (
        <SiteTextTab
          initial={initialSiteText}
          artists={artists}
          say={say}
          onSaved={onSaved}
        />
      )}

      <ToastSlot message={toast} />
    </section>
  );
}

function RecordCard({
  record,
  first,
  last,
  onChanged,
  say,
}: {
  record: AdminRecord;
  first: boolean;
  last: boolean;
  onChanged: () => void;
  say: (m: string) => void;
}) {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");

  const status = !record.published ? "Draft" : record.listed ? "Published" : "Hidden";
  const tone = !record.published
    ? "var(--sh-warning)"
    : record.listed
      ? "var(--sh-brass-bright)"
      : "var(--sh-ink-muted)";

  /* The answer is read, not discarded — the same reason as in the editor: a
     rejected write reached the card as a value that quietly put itself back. */
  async function put(body: unknown) {
    try {
      const res = await fetch(`/api/admin/records/${record.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const answer = await res.json().catch(() => ({}));
        say(
          typeof answer?.error === "string"
            ? answer.error
            : "That didn't save. It's still here — try again.",
        );
      }
    } catch {
      say("I couldn't reach the server. Nothing saved yet.");
      return;
    }
    onChanged();
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.reorder}>
          <button
            type="button"
            className={styles.reorderButton}
            aria-label={`Move ${record.albumTitle} up`}
            disabled={first}
            onClick={() => put({ move: "up" })}
          >
            <ChevronUp size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className={styles.reorderButton}
            aria-label={`Move ${record.albumTitle} down`}
            disabled={last}
            onClick={() => put({ move: "down" })}
          >
            <ChevronDown size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className={styles.cardMain}>
          <div className={styles.cardTop}>
            <span className={type_.signage}>{record.artistName}</span>
            <PressedPlate tone={tone}>{status}</PressedPlate>
          </div>
          <div className={styles.cardAlbum}>{record.albumTitle}</div>
          <div className={`${type_.meta} ${styles.cardMeta}`}>
            {recordMeta(record.year, record.trackCount, record.totalSeconds)}
          </div>

          <div className={styles.phraseRow}>
            <label className={styles.phraseLabel} htmlFor={`phrase-${record.id}`}>
              Phrase
            </label>
            <input
              id={`phrase-${record.id}`}
              className={styles.phraseInput}
              type="text"
              value={phrase}
              /* A phrase can be replaced but never read back: only its hash was
                 ever stored. The placeholder says which of the two states this
                 record is in without pretending the value is recoverable. */
              placeholder={record.hasPhrase ? "set — type to replace" : "nobody gets in"}
              autoComplete="off"
              onChange={(e) => setPhrase(e.target.value)}
              onBlur={async () => {
                if (!phrase) return;
                await put({ phrase });
                setPhrase("");
                say("Phrase changed. The old one stops working now.");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button
          type="button"
          className={styles.action}
          onClick={() => router.push(`/admin/${record.id}`)}
        >
          Open it
        </button>

        <button
          type="button"
          className={styles.actionQuiet}
          onClick={async () => {
            await put({ published: !record.published });
            say(
              record.published
                ? "Back to a draft — off the site for now."
                : "Published. It's on the site behind its phrase.",
            );
          }}
        >
          {record.published ? "Move back to drafts" : "Publish it"}
        </button>

        <div className={styles.spacer}>
          <Switch
            label="Listed"
            checked={record.listed}
            onChange={async (next) => {
              await put({ listed: next });
              say(
                next
                  ? "Back on the list."
                  : "Off the list. The direct link still works.",
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SiteTextTab({
  initial,
  artists,
  say,
  onSaved,
}: {
  initial: SiteText;
  /** The live count, for the preview — the same string the catalog will draw. */
  artists: string;
  say: (m: string) => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  /* The callbacks, reachable from the timer without being watched by it.

     What the debounce is waiting for is the typing to stop, and only `text`
     says anything about that. A callback in the dependency array means every
     re-render of the desk restarts the wait — and, when the callback is the
     one the save itself triggers, means the save schedules its own successor
     and the loop never closes. A ref is read at the moment the timer fires, so
     it is always current without ever being a reason to re-arm. */
  const latest = useRef({ say, onSaved });
  latest.current = { say, onSaved };

  /* "Saved as you type." is a promise, so the save is debounced rather than
     tied to a button — but not on the first render, which would write the
     values straight back the moment the tab opens. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/site-text", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(text),
        });
        if (!res.ok) {
          // A promise of "saved as you type" that quietly did not is worse
          // than no promise. The words on screen are still the owner's; only
          // the database is behind.
          latest.current.say("That didn't save. It's still here — try again.");
          return;
        }
      } catch {
        latest.current.say("I couldn't reach the server. Nothing saved yet.");
        return;
      }
      latest.current.say("Saved.");
      latest.current.onSaved();
    }, 700);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // `say` and `onSaved` are deliberately not dependencies — see `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const set = (patch: Partial<SiteText>) => setText((t) => ({ ...t, ...patch }));

  return (
    <div className={styles.siteText}>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="st-eyebrow">
          Eyebrow
        </label>
        <input
          id="st-eyebrow"
          className={styles.input}
          value={text.eyebrow}
          onChange={(e) => set({ eyebrow: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="st-title">
          Headline
        </label>
        <input
          id="st-title"
          className={styles.input}
          value={text.title}
          onChange={(e) => set({ title: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="st-intro">
          Opening paragraph
        </label>
        <textarea
          id="st-intro"
          className={styles.textarea}
          value={text.intro}
          onChange={(e) => set({ intro: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="st-footer">
          Footer line
        </label>
        <input
          id="st-footer"
          className={styles.input}
          value={text.footer}
          onChange={(e) => set({ footer: e.target.value })}
        />
      </div>

      <div className={styles.readsAs}>
        <div className={styles.fieldLabel}>Reads as:</div>
        <div className={`${type_.metaSmall}`} style={{ marginTop: 8 }}>
          {artists} · {text.footer}
        </div>
        <div className={styles.savedNote} style={{ marginTop: 14 }}>
          Saved as you type.
        </div>
      </div>
    </div>
  );
}
