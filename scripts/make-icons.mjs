/*
 * The home-screen icons.
 *
 * Generated rather than drawn so the mark stays identical across the four sizes
 * and so the palette comes from the tokens rather than from somebody's eye:
 * night teal ground, a cream hairline for the record's edge, a brass label
 * ring, amber at the centre. Amber is the design's lit colour and this is the
 * one place outside the play button it is allowed to sit, because an icon is
 * not a view.
 *
 * Run once, by hand, when the mark changes:  node scripts/make-icons.mjs
 * The PNGs are committed — they are authored assets, not build output.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "public", "icons");

/* The tab icon and the iOS home-screen icon go in the app directory rather
   than public/, because Next's file convention picks them up from there and
   emits the <link> tags itself, with hashed URLs. Declaring them in the
   metadata object instead replaces the convention rather than adding to it —
   which is how the apple icon ended up linked and the favicon did not, leaving
   every page load to ask for /favicon.ico and take a 404 for an answer. */
const appDir = join(here, "..", "src", "app");

const PAGE = "#0B1819";
const CREAM = "#E8E3D7";
const BRASS = "#C5AE67";
const AMBER = "#C6862F";

/**
 * @param scale How much of the canvas the mark occupies. A maskable icon is
 *   cropped to a circle by the launcher, so its mark sits inside the 80% safe
 *   zone the spec asks for, with the ground carrying the rest.
 */
function svg(size, scale) {
  const c = size / 2;
  const r = (size / 2) * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PAGE}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.94}" fill="none" stroke="${CREAM}" stroke-opacity="0.22" stroke-width="${r * 0.02}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.78}" fill="none" stroke="${CREAM}" stroke-opacity="0.14" stroke-width="${r * 0.015}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.62}" fill="none" stroke="${CREAM}" stroke-opacity="0.14" stroke-width="${r * 0.015}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.44}" fill="none" stroke="${BRASS}" stroke-width="${r * 0.05}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.15}" fill="${AMBER}"/>
</svg>`;
}

async function write(name, size, scale, dir = out) {
  const png = await sharp(Buffer.from(svg(size, scale))).png().toBuffer();
  await writeFile(join(dir, name), png);
  console.log(`${name}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}

await mkdir(out, { recursive: true });

// The manifest's icons. 0.82 fills the tile; 0.6 keeps the mark clear of a
// launcher's circular crop.
await write("icon-192.png", 192, 0.82);
await write("icon-512.png", 512, 0.82);
await write("icon-maskable-512.png", 512, 0.6);

// Next's file conventions. The tab icon is larger than 16px so it survives a
// retina screen and a pinned tab.
await write("icon.png", 48, 0.94, appDir);
await write("apple-icon.png", 180, 0.82, appDir);
