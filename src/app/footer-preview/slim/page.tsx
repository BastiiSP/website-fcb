import FooterSlim from "../_components/FooterSlim";

export default function FooterSlimPreviewPage() {
  return (
    <>
      {/* Filler – schiebt den Footer ans Seitenende und zeigt ihn im Kontext */}
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <p className="max-w-md font-inter text-sm text-fcb-muted">
          Variante „Slim Bar“ – kompakt, alles in einer Zeile. Footer am Seitenende ↓
        </p>
      </div>
      <FooterSlim />
    </>
  );
}
