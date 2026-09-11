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
      <body>{children}</body>
    </html>
  );
}
