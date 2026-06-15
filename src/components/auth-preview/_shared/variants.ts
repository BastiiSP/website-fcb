import type { VariantMeta } from "./types";
import AuroraVariant from "../aurora/AuroraVariant";
import SplitVariant from "../split/SplitVariant";
import SpotlightVariant from "../spotlight/SpotlightVariant";
import MinimalVariant from "../minimal/MinimalVariant";
import PitchVariant from "../pitch/PitchVariant";

export const AUTH_VARIANTS: VariantMeta[] = [
  {
    slug: "aurora",
    label: "Aurora",
    beschreibung: "Lebendiger animierter Hintergrund, Formular als fokussierte Card darüber.",
    Component: AuroraVariant,
  },
  {
    slug: "split",
    label: "Split",
    beschreibung: "Räumliche Trennung: Branding-Bereich neben Formular-Bereich.",
    Component: SplitVariant,
  },
  {
    slug: "spotlight",
    label: "Spotlight",
    beschreibung: "Großflächiges Visual dominiert, kompaktes schwebendes Formular.",
    Component: SpotlightVariant,
  },
  {
    slug: "minimal",
    label: "Minimal",
    beschreibung: "Ohne Visuals – nur Typografie, Spacing und Details.",
    Component: MinimalVariant,
  },
  {
    slug: "pitch",
    label: "Pitch",
    beschreibung: "Eigenständige Interpretation aus dem bestehenden FCB-Design-Vokabular.",
    Component: PitchVariant,
  },
];

export const DEFAULT_VARIANT_SLUG = AUTH_VARIANTS[0].slug;

export function getVariant(slug: string): VariantMeta | undefined {
  return AUTH_VARIANTS.find((v) => v.slug === slug);
}
