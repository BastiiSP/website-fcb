"use client";

interface Tab {
  id: string;
  label: string;
}

/**
 * Schlanke, kontrollierte Tab-Leiste (Profil nutzt sie). a11y: role=tab,
 * aria-selected; aktiver Tab via fcb-blue unterstrichen.
 */
export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-fcb-border">
      {tabs.map((t) => {
        const istAktiv = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={istAktiv}
            onClick={() => onChange(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 font-oswald text-sm font-semibold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue ${
              istAktiv
                ? "border-fcb-blue text-fcb-text"
                : "border-transparent text-fcb-muted hover:text-fcb-text"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
