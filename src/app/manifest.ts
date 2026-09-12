import type { MetadataRoute } from "next";

/**
 * The web app manifest, which is what makes "Add to home screen" offer an app
 * rather than a bookmark.
 *
 * `standalone` is the point of it: opened from the home screen there is no
 * address bar, so the fixed player bar sits where a player bar should and the
 * amber button is not competing with browser chrome for the bottom of the
 * screen.
 *
 * Deliberately not read from the editable site text. A manifest is fetched
 * once and then cached by the platform — on iOS it is baked into the home
 * screen entry at the moment it is added — so a name that follows the site
 * text would drift out of step with it and there would be no way to tell.
 * A fixed name that is honest beats a dynamic one that is stale.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recordings",
    short_name: "Recordings",
    description: "A small catalog. Every record sits behind its own phrase.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1819",
    theme_color: "#0B1819",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
