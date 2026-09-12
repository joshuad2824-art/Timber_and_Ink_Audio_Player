"use client";

import { useEffect, useRef, useState } from "react";

import { encodeFlac, encodeMp3, titleFromFilename } from "./encode";
import { parseWav, WavError } from "./wav";
import desk from "@/app/admin/desk.module.css";
import styles from "./upload.module.css";

/* A Netlify function's request body caps at a few megabytes. Three is
   comfortably inside that with room for headers, and a lossless track comes out
   at ten or so pieces. */
const CHUNK_BYTES = 3 * 1024 * 1024;

type Job = {
  name: string;
  stage: string;
  ratio: number;
  error?: string;
  done?: boolean;
};

function uploadId(): string {
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

/**
 * Turn a WAV master into the files the site actually serves, here in the
 * browser, and send only those.
 *
 * The master never leaves the machine. A 42-minute 24/48 WAV is about 727 MB;
 * the FLAC and MP3 derived from it are a fraction of that, and they are the two
 * the site needs. Doing it the other way around would mean chunking 727 MB
 * through a function just to transcode it and chunk the results back.
 */
export function Upload({
  recordId,
  onDone,
}: {
  recordId: string;
  onDone: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  /* Two guards over the whole page, not just the drop zone.

     The copy under this button says "Drop in WAV masters", and dropping one
     anywhere the page does not claim it makes the browser navigate away and
     open the file instead — off the desk, mid-upload, taking every job in
     flight with it. Cancelling the default everywhere means a miss does
     nothing at all, which is the least a miss should do. */
  useEffect(() => {
    const swallow = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, []);

  /* And an encode is minutes of work that exists nowhere else: the WAV is
     still on the owner's disk, but the FLAC and the MP3 being made from it are
     only here. A reload halfway through starts the whole thing again. */
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  function update(index: number, patch: Partial<Job>) {
    setJobs((prev) => prev.map((j, i) => (i === index ? { ...j, ...patch } : j)));
  }

  async function send(
    trackId: string,
    format: "flac" | "mp3",
    bytes: Uint8Array,
    seconds: number,
    index: number,
  ) {
    const id = uploadId();
    const chunks = Math.ceil(bytes.byteLength / CHUNK_BYTES);

    for (let i = 0; i < chunks; i++) {
      const slice = bytes.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES);
      const res = await fetch(
        `/api/admin/records/${recordId}/tracks/${trackId}/audio?upload=${id}&chunk=${i}`,
        {
          method: "PUT",
          headers: { "content-type": "application/octet-stream" },
          body: slice as BodyInit,
        },
      );
      if (!res.ok) throw new Error(`Upload stopped at piece ${i + 1} of ${chunks}.`);
      update(index, {
        stage: `Sending ${format.toUpperCase()}`,
        ratio: (i + 1) / chunks,
      });
    }

    const res = await fetch(
      `/api/admin/records/${recordId}/tracks/${trackId}/audio`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ upload: id, chunks, format, seconds }),
      },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? "The upload couldn't be finished.");
    }
  }

  /**
   * A dropped file that is actually a WAV.
   *
   * Checked by extension rather than by type: a browser reports a .wav as
   * audio/wav, audio/x-wav, audio/wave or nothing at all depending on the
   * platform, and the parser will say soon enough if the bytes disagree.
   */
  function wavsOnly(list: File[]): File[] {
    return list.filter((file) => file.name.toLowerCase().endsWith(".wav"));
  }

  async function handle(files: File[] | FileList) {
    setBusy(true);
    const list = Array.from(files);
    setJobs(list.map((f) => ({ name: f.name, stage: "Reading", ratio: 0 })));

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        update(i, { stage: "Reading", ratio: 0 });
        const audio = parseWav(await file.arrayBuffer());

        // The track row comes first so both encodings have somewhere to land,
        // and so a failure halfway leaves a visible row rather than nothing.
        const created = await fetch(`/api/admin/records/${recordId}/tracks`, {
          method: "POST",
        });
        if (!created.ok) throw new Error("Couldn't add the track.");
        const { id: trackId } = await created.json();

        await fetch(`/api/admin/records/${recordId}/tracks/${trackId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: titleFromFilename(file.name),
            length: String(Math.round(audio.seconds)),
          }),
        });

        const flac = await encodeFlac(audio, (p) => update(i, { ...p }));
        await send(trackId, "flac", flac, audio.seconds, i);

        const mp3 = await encodeMp3(audio, (p) => update(i, { ...p }));
        await send(trackId, "mp3", mp3, audio.seconds, i);

        update(i, { stage: "Done", ratio: 1, done: true });
        onDone();
      } catch (e) {
        update(i, {
          stage: "Stopped",
          ratio: 0,
          error:
            e instanceof WavError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Something went wrong with that file.",
        });
      }
    }

    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div
      className={`${styles.wrap} ${over ? styles.wrapOver : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setOver(true);
      }}
      onDragLeave={(e) => {
        // Only when the pointer has actually left this element, not when it
        // has merely crossed onto the label or the job list inside it.
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (busy) return;
        const wavs = wavsOnly(Array.from(e.dataTransfer.files));
        if (wavs.length === 0) {
          setJobs([
            {
              name: "That wasn't a WAV",
              stage: "Stopped",
              ratio: 0,
              error: "Masters come in as WAV. Nothing else is handled here.",
            },
          ]);
          return;
        }
        void handle(wavs);
      }}
    >
      <input
        ref={input}
        type="file"
        accept=".wav,audio/wav,audio/x-wav,audio/wave"
        multiple
        className={styles.fileInput}
        id="audio-files"
        disabled={busy}
        onChange={(e) => {
          if (e.target.files?.length) void handle(e.target.files);
        }}
      />
      <label htmlFor="audio-files" className={desk.secondaryButton} data-disabled={busy}>
        {busy ? "Working…" : "Upload audio"}
      </label>

      <p className={styles.explain}>
        Drop in WAV masters. Your browser makes the FLAC the site plays and the
        MP3 people download — the WAV itself never leaves this machine.
      </p>

      {jobs.length > 0 && (
        <ul className={styles.jobs}>
          {jobs.map((job, i) => (
            <li key={`${job.name}-${i}`} className={styles.job}>
              <span className={styles.jobName}>{job.name}</span>
              <span className={job.error ? styles.jobError : styles.jobStage}>
                {job.error ?? (job.done ? "Done" : `${job.stage} ${Math.round(job.ratio * 100)}%`)}
              </span>
              {!job.error && !job.done && (
                <span className={styles.meter} aria-hidden="true">
                  <span
                    className={styles.meterFill}
                    style={{ width: `${Math.round(job.ratio * 100)}%` }}
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
