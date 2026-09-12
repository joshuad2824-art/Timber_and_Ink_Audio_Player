import { getCoverAsset } from "@/data/catalog";
import { readCover } from "@/data/storage";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * One record's cover art.
 *
 * No Range handling here, unlike the audio route. A cover is a few hundred
 * kilobytes that an <img> asks for once, whole; byte ranges are what make
 * seeking work in a forty-megabyte track and have nothing to offer a JPEG.
 *
 * The immutable cache is safe because the page asks for this with the upload
 * time in the query string. Replace the art and the URL changes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG.test(slug)) return new Response("Not found", { status: 404 });

  // Checks the unlock cookie. A locked record answers exactly like one with no
  // cover and one that does not exist.
  const asset = await getCoverAsset(slug);
  if (!asset) return new Response("Not found", { status: 404 });

  const bytes = await readCover(asset.blobKey);
  if (!bytes) return new Response("Not found", { status: 404 });

  return new Response(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": asset.mimeType,
      "content-length": String(bytes.byteLength),
      // Private: this is one listener's authorized copy of a record's sleeve
      // and must never be held by a shared cache.
      "cache-control": "private, max-age=31536000, immutable",
    },
  });
}
