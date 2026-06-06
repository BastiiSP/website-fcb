import FooterDreispaltig from "../_components/FooterDreispaltig";

export default function FooterDreispaltigPreviewPage() {
  return (
    <>
      {/* Filler – schiebt den Footer ans Seitenende und zeigt ihn im Kontext */}
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <p className="max-w-md font-inter text-sm text-fcb-muted">
          Variante „Dreispaltig“ – klassisches Spalten-Layout mit mehr Atemraum. Footer am Seitenende ↓
        </p>
      </div>
      <FooterDreispaltig />
    </>
  );
}
