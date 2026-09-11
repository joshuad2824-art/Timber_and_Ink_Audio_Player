"use client";

import { useRef, useState } from "react";

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

  async function handle(files: FileList) {
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
    <div className={styles.wrap}>
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
