import type { NextConfig } from "next";
import path from "path";

// ✅ Konfiguration für Next.js 16
const nextConfig: NextConfig = {
  // Turbopack-Root explizit setzen, da Next.js 16 sonst durch das package-lock.json
  // im Home-Verzeichnis das falsche Workspace-Root erkennt
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      // Bestehende erlaubte Bildquellen
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "img.olympics.com",
      },
      {
        protocol: "https",
        hostname: "contents.mediadecathlon.com",
      },

      // ✅ Dynamische Instagram-Quellen (alle Subdomains via Wildcards)
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;