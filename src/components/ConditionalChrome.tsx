"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import CookieBanner from "@/components/consent/CookieBanner";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // Design-Preview-Routen sind Standalone-Erlebnisse: kein globaler Header/Footer,
  // kein main-Padding. Consent bleibt aktiv (DSGVO gilt auch auf Preview-Routen).
  const isPreviewRoute = pathname.startsWith("/auth-preview");

  if (isPreviewRoute) {
    return (
      <ConsentProvider>
        {children}
        <CookieBanner />
      </ConsentProvider>
    );
  }

  return (
    <ConsentProvider>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
      <CookieBanner />
    </ConsentProvider>
  );
}
