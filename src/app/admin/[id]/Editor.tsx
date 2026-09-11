"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react";

import { PressedPlate } from "@/ui/devices";
import { Switch } from "@/ui/Switch";
import { Upload } from "@/desk/Upload";
import { ToastSlot, useToast } from "@/chrome/Toast";
import { formatDuration } from "@/data/phrase";
import type { AdminRecord, AdminTrack } from "@/data/admin";
import styles from "./editor.module.css";
import desk from "../desk.module.css";
import type_ from "@/ui/type.module.css";

type FullRecord = AdminRecord & { tracks: AdminTrack[] };

export function Editor({ record: initial }: { record: FullRecord }) {
  const router = useRouter();
  const [record, setRecord] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [toast, say] = useToast();

  useEffect(() => setRecord(initial), [initial]);

  async function reload() {
    const res = await fetch(`/api/admin/records/${record.id}`);
    if (res.ok) setRecord((await res.json()).record);
    router.refresh();
  }

  async function put(body: unknown) {
    await fetch(`/api/admin/records/${record.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    await reload();
  }

  const status = !record.published ? "Draft" : record.listed ? "Published" : "Hidden";
  const tone = !record.published
    ? "var(--sh-warning)"
    : record.listed
      ? "var(--sh-brass-bright)"
      : "var(--sh-ink-muted)";

  // The two flags combine into four states, and which one you are in is not
  // obvious from two switches. So the desk says it in a sentence.
  const standing = !record.published
    ? "A draft. Nobody can reach it, phrase or no phrase."
    : record.listed
      ? "On the site, behind its phrase."
      : "Published, but off the list — only a direct link finds it.";

  return (
    <section className={desk.page}>
      <div className={styles.header}>
        <a href="/admin" className={type_.metaSmall}>
          Back to the desk
        </a>
        <PressedPlate tone={tone}>{status}</PressedPlate>
      </div>

      <h1 className={`${type_.albumTitle} ${styles.title}`}>{record.albumTitle}</h1>
      <div className={styles.titleRule} />

      <div className={styles.grid}>
        <Field
          label="Artist"
          value={record.artistName}
          onCommit={(v) => put({ artistName: v })}
        />
        <Field
          label="Record title"
          value={record.albumTitle}
          onCommit={(v) => put({ albumTitle: v })}
        />
        <Field label="Year" value={String(record.year)} onCommit={(v) => put({ year: v })} />
        <div className={desk.field}>
          <label className={desk.fieldLabel} htmlFor="phrase">
            Access phrase
          </label>
          <PhraseField hasPhrase={record.hasPhrase} onCommit={(v) => put({ phrase: v })} say={say} />
          <div className={styles.note}>
            This is what opens the record. Leaving it empty keeps everyone out.
          </div>
        </div>
      </div>

      <div className={desk.field} style={{ marginTop: 22 }}>
        <label className={desk.fieldLabel} htmlFor="intro">
          A word about it
        </label>
        <TextArea value={record.intro} onCommit={(v) => put({ intro: v })} />
      </div>

      <div className={styles.rule} />

      <div className={styles.standingRow}>
        <div className={styles.coverDrop}>
          {/* Cover upload lands with audio upload, in the next pass. */}
          <span className={type_.metaSmall}>Cover art</span>
          <span className={styles.coverHint}>Coming with uploads</span>
        </div>

        <div className={styles.standing}>
          <div className={desk.fieldLabel}>Where it stands</div>
          <button
            type="button"
            className={desk.secondaryButton}
            style={{ marginTop: 12 }}
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

          <div className={styles.switchRow}>
            <Switch
              label="Listed on the site"
              checked={record.listed}
              onChange={(next) => put({ listed: next })}
            />
          </div>

          <p className={styles.standingNote}>{standing}</p>
        </div>
      </div>

      <h2 className={`${type_.signageSmall} ${styles.tracksHeading}`}>The tracks</h2>

      <div className={styles.tracks}>
        {record.tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            recordId={record.id}
            track={track}
            index={i}
            first={i === 0}
            last={i === record.tracks.length - 1}
            onChanged={reload}
          />
        ))}
      </div>

      {record.tracks.length === 0 && (
        <div className={desk.empty}>No tracks yet. Add one, or upload the files.</div>
      )}

      <div className={styles.uploadRow}>
        <Upload recordId={record.id} onDone={reload} />
      </div>

      <div className={styles.trackActions}>
        <button
          type="button"
          className={desk.secondaryButton}
          onClick={async () => {
            await fetch(`/api/admin/records/${record.id}/tracks`, { method: "POST" });
            await reload();
          }}
        >
          Add a blank track
        </button>
      </div>

      <div className={styles.removeRow}>
        {/* Arms in place rather than opening a modal — there are no modals
            anywhere in this design, and the button is the confirmation. */}
        <button
          type="button"
          className={confirming ? styles.removeArmed : styles.remove}
          onClick={async () => {
            if (!confirming) {
              setConfirming(true);
              return;
            }
            await fetch(`/api/admin/records/${record.id}`, { method: "DELETE" });
            router.push("/admin");
            router.refresh();
          }}
        >
          {confirming ? "Remove it for good?" : "Remove this record"}
        </button>
        {confirming && (
          <button
            type="button"
            className={desk.actionQuiet}
            onClick={() => setConfirming(false)}
          >
            Keep it
          </button>
        )}
      </div>

      <ToastSlot message={toast} />
    </section>
  );
}

/** Commits on blur rather than every keystroke, so a rename is one write. */
function Field({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <div className={desk.field}>
      <label className={desk.fieldLabel} htmlFor={`f-${label}`}>
        {label}
      </label>
      <input
        id={`f-${label}`}
        className={desk.input}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onCommit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
    </div>
  );
}

function TextArea({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <textarea
      id="intro"
      className={desk.textarea}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onCommit(draft)}
    />
  );
}

function PhraseField({
  hasPhrase,
  onCommit,
  say,
}: {
  hasPhrase: boolean;
  onCommit: (v: string) => void;
  say: (m: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <input
      id="phrase"
      className={desk.input}
      type="text"
      value={draft}
      placeholder={hasPhrase ? "set — type to replace" : "nobody gets in"}
      autoComplete="off"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (!draft) return;
        onCommit(draft);
        setDraft("");
        say("Phrase changed. The old one stops working now.");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

function TrackRow({
  recordId,
  track,
  index,
  first,
  last,
  onChanged,
}: {
  recordId: string;
  track: AdminTrack;
  index: number;
  first: boolean;
  last: boolean;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(track.title);
  const [length, setLength] = useState(formatDuration(track.seconds));
  const armed = useRef(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setTitle(track.title);
    setLength(formatDuration(track.seconds));
  }, [track.title, track.seconds]);

  async function put(body: unknown) {
    await fetch(`/api/admin/records/${recordId}/tracks/${track.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    onChanged();
  }

  return (
    <div className={styles.trackRow}>
      <div className={desk.reorder}>
        <button
          type="button"
          className={desk.reorderButton}
          aria-label={`Move ${track.title} up`}
          disabled={first}
          onClick={() => put({ move: "up" })}
        >
          <ChevronUp size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={desk.reorderButton}
          aria-label={`Move ${track.title} down`}
          disabled={last}
          onClick={() => put({ move: "down" })}
        >
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      </div>

      <span className={`${type_.meta} ${styles.trackIndex}`}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <input
        className={`${desk.input} ${styles.trackTitle}`}
        value={title}
        aria-label={`Title of track ${index + 1}`}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title !== track.title && put({ title })}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />

      <input
        className={`${desk.input} ${styles.trackLength}`}
        value={length}
        aria-label={`Length of track ${index + 1}`}
        /* Accepts 3:52 or 232 — whichever the owner has to hand. */
        onChange={(e) => setLength(e.target.value)}
        onBlur={() => put({ length })}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />

      <button
        type="button"
        className={desk.reorderButton}
        aria-label={track.hidden ? `Show ${track.title}` : `Hide ${track.title}`}
        onClick={() => put({ hidden: !track.hidden })}
      >
        {track.hidden ? (
          <EyeOff size={16} strokeWidth={1.5} color="var(--sh-warning)" />
        ) : (
          <Eye size={16} strokeWidth={1.5} />
        )}
      </button>

      {track.formats.length > 0 && (
        <span className={styles.trackFormats}>{track.formats.join(" · ")}</span>
      )}

      <button
        type="button"
        className={confirming ? styles.trashArmed : desk.reorderButton}
        aria-label={confirming ? `Really remove ${track.title}?` : `Remove ${track.title}`}
        onClick={async () => {
          if (!confirming) {
            setConfirming(true);
            armed.current = true;
            setTimeout(() => {
              if (armed.current) setConfirming(false);
            }, 4000);
            return;
          }
          armed.current = false;
          await fetch(`/api/admin/records/${recordId}/tracks/${track.id}`, {
            method: "DELETE",
          });
          onChanged();
        }}
      >
        <Trash2 size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
