/**
 * Preparing a picked photo for the mat, in the owner's own browser.
 *
 * A photo off a phone is three to twelve megabytes of 4032×3024, and a Netlify
 * function's request body caps at a few. So the same reasoning as the audio
 * path applies, for the same reason: do the work here and only the finished
 * thing crosses the wire. Unlike the audio path there is nothing to preserve —
 * the mat is 420px wide and shows a square crop — so this is a plain downscale
 * rather than an exercise in losslessness.
 *
 * It also strips everything that is not pixels. A phone writes the place and
 * the minute a photo was taken into its EXIF, and a record sleeve is not the
 * place to publish where the owner lives. Re-encoding through a canvas leaves
 * none of it behind, which is a side effect worth having on purpose.
 */

/** Long edge of the stored image. The mat shows 420px; this allows for retina
 *  and for the owner wanting the file to outlast this layout. */
const MAX_EDGE = 1400;

/** Quality for the JPEG. 0.86 is where the artefacts stop being visible on a
 *  photograph at this size; above it the file grows and the picture does not. */
const QUALITY = 0.86;

export type PreparedCover = {
  bytes: Uint8Array;
  mime: "image/jpeg" | "image/png";
  width: number;
  height: number;
};

/**
 * Decode a picked file, honouring the orientation the camera recorded.
 *
 * `imageOrientation: "from-image"` is the whole point of going through
 * createImageBitmap. A phone held sideways writes landscape pixels and an EXIF
 * tag saying "rotate this"; drawing the raw pixels to a canvas obeys nothing
 * and produces a sleeve on its side. Older Safari has neither the option nor
 * the function, so an <img> element decodes instead — it applies orientation
 * itself, which is the behaviour we want for a different reason.
 */
async function decode(file: Blob): Promise<{
  draw: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        draw: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      /* fall through to the element */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("That file didn't open as an image."));
      img.src = url;
    });
    return {
      draw: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/**
 * Scale a picked file down to something the upload route will take.
 *
 * PNG is kept as PNG when the picture has transparency to lose — artwork with
 * a cut-out edge would gain a black background through a JPEG. Everything else
 * becomes a JPEG, because a photograph stored as a PNG is several times the
 * bytes for no visible difference.
 */
export async function prepareCover(file: Blob): Promise<PreparedCover> {
  const { draw, width, height, release } = await decode(file);

  try {
    if (!width || !height) throw new Error("That image had no size to it.");

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser wouldn't give me a canvas to work on.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(draw, 0, 0, w, h);

    const keepAlpha = file.type === "image/png" && hasTransparency(ctx, w, h);
    const mime = keepAlpha ? "image/png" : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, mime === "image/jpeg" ? QUALITY : undefined),
    );
    if (!blob) throw new Error("The image wouldn't re-encode.");

    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      mime,
      width: w,
      height: h,
    };
  } finally {
    release();
  }
}

/**
 * Does any pixel have an alpha below opaque?
 *
 * Sampled on a grid rather than read pixel by pixel: two million reads to
 * answer a yes-or-no question would lock the tab up, and a cut-out that shows
 * nowhere on a 24×24 grid is a cut-out nobody would see in a 420px mat either.
 */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const steps = 24;
  for (let y = 0; y < steps; y++) {
    for (let x = 0; x < steps; x++) {
      const px = Math.min(w - 1, Math.floor((x / steps) * w));
      const py = Math.min(h - 1, Math.floor((y / steps) * h));
      if (ctx.getImageData(px, py, 1, 1).data[3] < 255) return true;
    }
  }
  return false;
}
