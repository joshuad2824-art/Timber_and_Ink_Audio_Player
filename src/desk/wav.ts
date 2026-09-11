/**
 * A WAV reader, for the desk's upload path.
 *
 * The masters are WAV and the derived FLAC has to be bit-identical, so the
 * samples are read straight out of the file rather than decoded. The obvious
 * alternative — Web Audio's decodeAudioData — is the wrong tool twice over: it
 * can resample to the AudioContext's rate, and it hands back floats, so
 * "lossless" would depend on a round trip through a format the file was never
 * in. Parsing the container is a hundred lines and leaves no room for doubt.
 */

export type WavAudio = {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  /** Interleaved samples as signed integers, at the file's own bit depth. */
  samples: Int32Array;
  /** Frames, i.e. samples per channel. */
  frames: number;
  seconds: number;
};

export class WavError extends Error {}

const str = (view: DataView, offset: number, length: number) =>
  String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + offset, length));

/**
 * Read a RIFF/WAVE file.
 *
 * Chunks are walked rather than assumed: real files from real DAWs carry LIST,
 * bext, iXML and other metadata before `data`, and a reader that trusts the
 * canonical 44-byte header will hand back metadata as if it were audio.
 */
export function parseWav(buffer: ArrayBuffer): WavAudio {
  if (buffer.byteLength < 12) throw new WavError("That file is too short to be a WAV.");

  const view = new DataView(buffer);
  if (str(view, 0, 4) !== "RIFF" || str(view, 8, 4) !== "WAVE") {
    throw new WavError("That doesn't look like a WAV file.");
  }

  let fmt: {
    audioFormat: number;
    channels: number;
    sampleRate: number;
    bitsPerSample: number;
  } | null = null;
  let dataOffset = -1;
  let dataLength = 0;

  let offset = 12;
  while (offset + 8 <= buffer.byteLength) {
    const id = str(view, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;

    if (id === "fmt ") {
      let audioFormat = view.getUint16(body, true);
      const channels = view.getUint16(body + 2, true);
      const sampleRate = view.getUint32(body + 4, true);
      const bitsPerSample = view.getUint16(body + 14, true);

      // WAVE_FORMAT_EXTENSIBLE hides the real format in a sub-GUID. Its first
      // two bytes carry the same code, which is all we need to tell PCM from
      // float.
      if (audioFormat === 0xfffe && size >= 26) {
        audioFormat = view.getUint16(body + 24, true);
      }

      fmt = { audioFormat, channels, sampleRate, bitsPerSample };
    } else if (id === "data") {
      dataOffset = body;
      // Some writers leave the data size at 0 or 0xFFFFFFFF when streaming;
      // trust the file's actual length in that case rather than the header.
      dataLength =
        size === 0 || body + size > buffer.byteLength ? buffer.byteLength - body : size;
    }

    // Chunks are word-aligned: an odd size is followed by a pad byte.
    offset = body + size + (size % 2);
  }

  if (!fmt) throw new WavError("That WAV has no format chunk.");
  if (dataOffset < 0) throw new WavError("That WAV has no audio in it.");

  const { audioFormat, channels, sampleRate, bitsPerSample } = fmt;

  if (audioFormat !== 1 && audioFormat !== 3) {
    throw new WavError(
      "That WAV is compressed. Export it as plain PCM and try again.",
    );
  }
  if (channels < 1 || channels > 2) {
    throw new WavError(`${channels} channels is more than this player handles.`);
  }

  const bytesPerSample = bitsPerSample / 8;
  const frames = Math.floor(dataLength / (bytesPerSample * channels));
  const total = frames * channels;
  const samples = new Int32Array(total);
  const bytes = new Uint8Array(buffer, dataOffset, frames * bytesPerSample * channels);

  if (audioFormat === 3) {
    // 32-bit float masters. Scaled to 24-bit integers, which is where the
    // sample values in a float file actually live; FLAC has no float mode.
    if (bitsPerSample !== 32) throw new WavError("Only 32-bit float WAVs are supported.");
    const floats = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let i = 0; i < total; i++) {
      const v = Math.max(-1, Math.min(1, floats.getFloat32(i * 4, true)));
      samples[i] = Math.round(v * 8388607);
    }
    return { sampleRate, channels, bitsPerSample: 24, samples, frames, seconds: frames / sampleRate };
  }

  switch (bitsPerSample) {
    case 8:
      // 8-bit WAV is unsigned, alone among the depths.
      for (let i = 0; i < total; i++) samples[i] = bytes[i] - 128;
      break;
    case 16:
      for (let i = 0; i < total; i++) {
        const o = i * 2;
        samples[i] = (bytes[o] | (bytes[o + 1] << 8) | 0) << 16 >> 16;
      }
      break;
    case 24:
      for (let i = 0; i < total; i++) {
        const o = i * 3;
        // Sign-extend by shifting the 24-bit value up and arithmetic-shifting
        // back down.
        samples[i] =
          ((bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16)) << 8) >> 8;
      }
      break;
    case 32:
      for (let i = 0; i < total; i++) {
        const o = i * 4;
        samples[i] =
          bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24);
      }
      break;
    default:
      throw new WavError(`${bitsPerSample}-bit audio isn't something I can read.`);
  }

  return {
    sampleRate,
    channels,
    bitsPerSample,
    samples,
    frames,
    seconds: frames / sampleRate,
  };
}

/** Down-convert to 16-bit for the MP3 encoder, which is lossy regardless. */
export function toInt16Channels(audio: WavAudio): Int16Array[] {
  const shift = audio.bitsPerSample - 16;
  const out: Int16Array[] = [];
  for (let c = 0; c < audio.channels; c++) {
    const channel = new Int16Array(audio.frames);
    for (let f = 0; f < audio.frames; f++) {
      const v = audio.samples[f * audio.channels + c];
      channel[f] = shift > 0 ? v >> shift : shift < 0 ? v << -shift : v;
    }
    out.push(channel);
  }
  return out;
}
