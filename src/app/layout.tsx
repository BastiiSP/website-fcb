import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

// ConditionalChrome rendert Header/Footer + main-Padding um alle Routen.
// (Die früheren Design-Exploration-Routen wurden nach Runde 2 entfernt.)
import ConditionalChrome from "@/components/ConditionalChrome";

// Marken-Schriften (Oswald = Headlines, Inter = Body) als CSS-Variablen.
// Werden in modernen Komponenten via font-oswald / font-inter genutzt.
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
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* FOUC-Schutz: setzt das Theme VOR dem ersten Paint aus localStorage,
            Fallback dunkel. Inline + blockierend, daher kein Aufblitzen. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body
        // Oswald & Inter werden als CSS-Variablen verfügbar gemacht und in
        // modernen Komponenten via font-oswald / font-inter (Tailwind) genutzt.
        // bg/color kommen jetzt aus globals.css (body-Regel mit semantischen Tokens).
        className={`${oswald.variable} ${inter.variable} antialiased`}
      >
        {/* ConditionalChrome rendert Header/Footer und das Main-Padding. */}
        <ConditionalChrome>{children}</ConditionalChrome>

        {/* Vercel Monitoring */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
