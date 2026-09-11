import type { WavAudio } from "./wav";
import { toInt16Channels } from "./wav";

/**
 * Deriving FLAC and MP3 from a WAV master, in the owner's own browser.
 *
 * This runs here rather than on a server for two reasons that both come from
 * the same place: a 42-minute 24/48 master is about 727 MB, and a Netlify
 * function's request body caps around 6 MB. The master would have to be
 * chunked up just to be transcoded, and then the derived files chunked back
 * down. Doing the work first means only the derivatives ever move, and they
 * are the ones that need to exist anyway.
 *
 * libFLAC compiled to wasm is about 240 KB. The obvious alternative,
 * ffmpeg.wasm, is 64 MB unpacked for two codecs out of several hundred.
 */

export type EncodeProgress = { stage: string; ratio: number };

type FlacModule = {
  on: (event: string, cb: () => void) => void;
  isReady: () => boolean;
  create_libflac_encoder: (
    sampleRate: number,
    channels: number,
    bps: number,
    compression: number,
    totalSamples: number,
    verify: boolean,
  ) => number;
  init_encoder_stream: (
    encoder: number,
    write: (data: Uint8Array, bytes: number) => void,
    metadata?: () => void,
  ) => number;
  FLAC__stream_encoder_process_interleaved: (
    encoder: number,
    buffer: Int32Array,
    samples: number,
  ) => boolean;
  FLAC__stream_encoder_finish: (encoder: number) => boolean;
  FLAC__stream_encoder_delete: (encoder: number) => void;
};

let flacPromise: Promise<FlacModule> | null = null;

/** Loaded once and reused: the wasm is small but not free to instantiate. */
async function loadFlac(): Promise<FlacModule> {
  if (flacPromise) return flacPromise;

  flacPromise = (async () => {
    /* Where the module should look for its own .wasm. Next bundles the JS glue,
       so the relative fetch it would otherwise do resolves against a chunk URL
       and 404s. This global has to be set before the module initialises.
       scripts/copy-flac-wasm.mjs puts the binary there at build time. */
    (globalThis as { FLAC_SCRIPT_LOCATION?: string }).FLAC_SCRIPT_LOCATION = "/flac/";

    const mod = (await import("libflacjs/dist/libflac.wasm.js")) as unknown as {
      default?: FlacModule;
    } & FlacModule;
    const Flac: FlacModule = mod.default ?? mod;

    if (Flac.isReady()) return Flac;
    await new Promise<void>((resolve) => Flac.on("ready", () => resolve()));
    return Flac;
  })();

  return flacPromise;
}

/**
 * Encode to FLAC, losslessly.
 *
 * `verify: true` makes libFLAC decode its own output as it goes and compare
 * against the input. It costs some time and is worth every bit of it: this is
 * the step that turns "FLAC is a lossless format" into "this particular file
 * is lossless", and a silent corruption here would be discovered by a listener
 * rather than by us.
 *
 * Compression 5 is libFLAC's default and the point where the curve flattens;
 * 8 spends considerably more time for around a percent.
 *
 * KNOWN GAP: the MD5 field in STREAMINFO is left unset. A stream encoder cannot
 * seek back to rewrite its own header once the audio has been written, and this
 * one is not given seek/tell callbacks. `flac -t` therefore says "cannot check
 * MD5 signature" — it still checks every frame's CRC and passes, and `verify`
 * above has already proved the encode lossless, but a future whole-file
 * integrity check against the original has nothing to compare to. Fixable by
 * patching the header from the metadata callback, which reports the final
 * STREAMINFO; not done yet because it is archival hygiene rather than
 * correctness.
 */
export async function encodeFlac(
  audio: WavAudio,
  onProgress?: (p: EncodeProgress) => void,
): Promise<Uint8Array> {
  const Flac = await loadFlac();

  // FLAC has no 8-bit-with-offset or float mode; the parser has already
  // normalized everything to signed integers, and anything under 16 bits is
  // widened rather than dithered down.
  const bps = audio.bitsPerSample < 16 ? 16 : audio.bitsPerSample;
  const scale = bps - audio.bitsPerSample;

  const encoder = Flac.create_libflac_encoder(
    audio.sampleRate,
    audio.channels,
    bps,
    5,
    audio.frames,
    true,
  );
  if (!encoder) throw new Error("The FLAC encoder wouldn't start.");

  const parts: Uint8Array[] = [];
  let total = 0;

  /* Three arguments, deliberately. A fourth is an ogg_serial_number, and
     supplying one — even 0 — switches the output to an Ogg-FLAC stream, which
     browsers will not play from an <audio> element. */
  const status = Flac.init_encoder_stream(
    encoder,
    (data: Uint8Array) => {
      // The callback's buffer is reused by the module, so each chunk has to be
      // copied out before the next one overwrites it.
      const copy = new Uint8Array(data.length);
      copy.set(data);
      parts.push(copy);
      total += copy.length;
    },
    () => {},
  );
  if (status !== 0) {
    Flac.FLAC__stream_encoder_delete(encoder);
    throw new Error("The FLAC encoder wouldn't initialise.");
  }

  // A block at a time, so a long track does not tie the tab up in one call and
  // progress can actually be reported.
  const FRAMES_PER_BLOCK = 65536;
  try {
    for (let start = 0; start < audio.frames; start += FRAMES_PER_BLOCK) {
      const count = Math.min(FRAMES_PER_BLOCK, audio.frames - start);
      const slice = audio.samples.subarray(
        start * audio.channels,
        (start + count) * audio.channels,
      );

      let block: Int32Array;
      if (scale === 0) {
        block = slice;
      } else {
        block = new Int32Array(slice.length);
        for (let i = 0; i < slice.length; i++) block[i] = slice[i] << scale;
      }

      const okay = Flac.FLAC__stream_encoder_process_interleaved(encoder, block, count);
      if (!okay) throw new Error("The FLAC encoder rejected a block of audio.");

      onProgress?.({ stage: "Encoding FLAC", ratio: (start + count) / audio.frames });
      // Yield so the tab stays answerable during a long album.
      await new Promise((r) => setTimeout(r, 0));
    }

    if (!Flac.FLAC__stream_encoder_finish(encoder)) {
      throw new Error("The FLAC encoder wouldn't finish cleanly.");
    }
  } finally {
    Flac.FLAC__stream_encoder_delete(encoder);
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * Encode to MP3 at 320 kbps, for the download links.
 *
 * Lossy on purpose and by request — this is the copy people take away, where
 * playing anywhere matters more than the last few dB.
 */
export async function encodeMp3(
  audio: WavAudio,
  onProgress?: (p: EncodeProgress) => void,
): Promise<Uint8Array> {
  const { Mp3Encoder } = await import("@breezystack/lamejs");

  const channels = toInt16Channels(audio);
  const encoder = new Mp3Encoder(audio.channels, audio.sampleRate, 320);

  const parts: Uint8Array[] = [];
  let total = 0;
  const push = (buf: Int8Array | Uint8Array) => {
    if (!buf || buf.length === 0) return;
    const copy = new Uint8Array(buf.length);
    copy.set(new Uint8Array(buf.buffer, buf.byteOffset, buf.length));
    parts.push(copy);
    total += copy.length;
  };

  // 1152 is an MP3 frame; lame wants whole multiples of it.
  const BLOCK = 1152 * 50;
  for (let start = 0; start < audio.frames; start += BLOCK) {
    const count = Math.min(BLOCK, audio.frames - start);
    const left = channels[0].subarray(start, start + count);
    const right = audio.channels > 1 ? channels[1].subarray(start, start + count) : left;

    push(
      audio.channels > 1
        ? encoder.encodeBuffer(left, right)
        : encoder.encodeBuffer(left),
    );

    onProgress?.({ stage: "Encoding MP3", ratio: (start + count) / audio.frames });
    await new Promise((r) => setTimeout(r, 0));
  }

  push(encoder.flush());

  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * A track title from a filename: drop the extension, drop a leading track
 * number, unslug, and sentence-case. The owner can always correct it, but
 * "04 - the long way home.wav" should not arrive as a title.
 */
export function titleFromFilename(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_. ]+/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!base) return "Untitled";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
