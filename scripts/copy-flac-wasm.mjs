import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Put libFLAC's wasm where the browser can fetch it.
 *
 * The JS glue gets bundled by Next, which breaks the relative fetch it does for
 * its own .wasm at runtime — the script no longer lives at a URL the binary
 * sits next to. Copying it into public/ and pointing FLAC_SCRIPT_LOCATION there
 * fixes that without unbundling anything.
 *
 * Copied at build time rather than committed so it can never drift from the
 * version in package.json.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules/libflacjs/dist/libflac.wasm.wasm");
const to = join(root, "public/flac/libflac.wasm.wasm");

await mkdir(dirname(to), { recursive: true });
await copyFile(from, to);
console.log("copied libflac.wasm.wasm -> public/flac/");
