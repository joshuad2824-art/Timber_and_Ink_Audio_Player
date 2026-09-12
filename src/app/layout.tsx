import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Bevan,
  Courier_Prime,
  Grape_Nuts,
  Oswald,
  Playfair_Display,
  Spectral,
} from "next/font/google";

import { RegisterServiceWorker } from "@/offline/Register";
import "@/ui/tokens.css";

/* The design system's fonts.css pulls seven families from Google over an
   @import, which blocks render. We load the same seven here — plus Grape Nuts
   for the hand-lettered asides — and bind each to the variable name the tokens
   already reference, so nothing downstream has to know the difference. */

const bevan = Bevan({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display-loaded",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-editorial-loaded",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-body-loaded",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui-loaded",
});

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-signage-loaded",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono-loaded",
});

const grapeNuts = Grape_Nuts({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-hand-loaded",
});

const fontVariables = [
  bevan.variable,
  playfair.variable,
  spectral.variable,
  archivo.variable,
  oswald.variable,
  courierPrime.variable,
  grapeNuts.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Recordings",
  description: "A small catalog. Every record sits behind its own phrase.",
  robots: { index: false, follow: false },

  /* Added to a home screen this opens without an address bar, which is the
     whole point of the offline work: the fixed player bar sits at the bottom of
     the screen instead of above browser chrome. A black status bar rather than
     a translucent one, so the back link does not need to dodge the notch.

     No `icons` here on purpose: icon.png and apple-icon.png sit next to this
     file and Next links them itself. Naming them here would replace that
     rather than add to it, and the one left out gets no link at all. */
  appleWebApp: { capable: true, title: "Recordings", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#0B1819",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
