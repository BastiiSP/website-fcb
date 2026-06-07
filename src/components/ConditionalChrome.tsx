import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import CookieBanner from "@/components/consent/CookieBanner";

/**
 * Rendert die globale Chrome (Header + main-Padding + Footer) um alle Routen.
 * Seit Einführung der DSGVO-Consent-Verwaltung umschließt der ConsentProvider
 * die gesamte Chrome – so können Header, Footer und alle Seiten-Inhalte den
 * Consent-Status über useConsent() lesen. Das CookieBanner wird global (z-60,
 * über allem) innerhalb des Providers gerendert.
 */
export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsentProvider>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
      <CookieBanner />
    </ConsentProvider>
  );
}
