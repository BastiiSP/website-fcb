import FooterZweizeilig from "../_components/FooterZweizeilig";

export default function FooterZweizeiligPreviewPage() {
  return (
    <>
      {/* Filler – schiebt den Footer ans Seitenende und zeigt ihn im Kontext */}
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <p className="max-w-md font-inter text-sm text-fcb-muted">
          Variante „Zweizeilig“ – Wappen + Adresse oben, Rechtliches + Social unten. Footer am Seitenende ↓
        </p>
      </div>
      <FooterZweizeilig />
    </>
  );
}
