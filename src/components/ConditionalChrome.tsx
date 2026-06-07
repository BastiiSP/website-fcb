import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Rendert die globale Chrome (Header + main-Padding + Footer) um alle Routen.
 * Früher wurden Design-Exploration-Routen (/variants, /footer-preview,
 * /navbar-preview, /dropdown-preview) hier per pathname ausgeblendet – diese
 * Preview-Routen wurden nach Abschluss von Design-Runde 2 entfernt, daher
 * rendert die Chrome jetzt bedingungslos. Wird einmalig im Root-Layout gewrappt.
 */
export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
    </>
  );
}
