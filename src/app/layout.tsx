import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

// ConditionalChrome blendet Header/Footer ausschließlich auf den
// Design-Exploration-Routen unter /variants/* aus. Alle bestehenden Routes
// (/, /login, /kalender, ...) bekommen Header und Footer wie gewohnt.
import ConditionalChrome from "@/components/ConditionalChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Zusatz-Schriften für die Hero-Varianten (Oswald = Headlines, Inter = Body).
// Werden nur in Komponenten unter /variants/* via font-oswald/font-inter aktiviert.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1. FC 1911 Burgkunstadt",
  description:
    "Die offizielle Vereinswebsite der Schuhstädter – mit aktuellen Spielberichten, Feierlichkeiten, Platzbuchung und mehr.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="light">
      <body
        // Oswald & Inter werden als zusätzliche CSS-Variablen verfügbar gemacht;
        // aktiv genutzt werden sie aber nur in den /variants/* Routes via
        // font-oswald / font-inter (Tailwind-Tokens).
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${inter.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {/* ConditionalChrome rendert Header/Footer und das Main-Padding wie
            bisher, unterdrückt beides aber auf /variants/* (Design-Exploration
            mit eigenem Full-Bleed-Layout). */}
        <ConditionalChrome>{children}</ConditionalChrome>

        {/* Vercel Monitoring */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
