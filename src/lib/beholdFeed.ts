/**
 * Geteilte Datenschicht für die Instagram-Carousel-Varianten (/instagram/*).
 *
 * Quelle: Behold.so JSON-Feed (Umgebungsvariable BEHOLD_FEED_URL).
 * Alle vier Design-Varianten beziehen ihre Posts ausschließlich über
 * getInstagramPosts() – eine einzige Datenquelle, eine einzige Struktur.
 *
 * Caching: serverseitig 1 Stunde (next.revalidate). Behold Free-Tier erlaubt
 * nur 1.200 MAI-Views/Monat, deshalb darf der Feed nicht pro Request geladen
 * werden. Da alle Varianten-Seiten Server Components mit demselben Feed-URL
 * sind, dedupliziert Next.js identische Requests zusätzlich automatisch.
 */

const REVALIDATE_SECONDS = 60 * 60; // 1 Stunde

/** Ein einzelnes Bild eines Posts inkl. Maßen (für next/image). */
export interface InstaImage {
  url: string;
  width?: number;
  height?: number;
}

/** Aufbereiteter Instagram-Post – das ist die gemeinsame Struktur für alle Varianten. */
export interface InstaPost {
  id: string;
  /** Permalink zum Original-Post auf Instagram (öffnet in neuem Tab). */
  permalink: string;
  /** Stabile Bild-URL (behold.pictures), nicht die ablaufende Instagram-CDN-URL. */
  imageUrl: string;
  /**
   * ALLE Bilder des Posts: bei CAROUSEL_ALBUM die children in Post-Reihenfolge,
   * sonst einelementig das Hauptbild. Additiv ergänzt für die News-Seite –
   * Bestandsnutzer (Homepage-Carousel) verwenden weiterhin imageUrl.
   */
  images: InstaImage[];
  /** Vollständige Caption – Kürzung auf 2–3 Zeilen passiert per CSS (line-clamp). */
  caption: string;
  /** ISO-Zeitstempel des Posts. */
  timestamp: string;
  /** IMAGE | CAROUSEL_ALBUM | VIDEO – alle werden als Bild-Card dargestellt. */
  mediaType: string;
}

/** Eine Bildgröße im Behold-Feed (sizes.small/medium/large/full). */
interface BeholdSize {
  mediaUrl: string;
  width: number;
  height: number;
}

/** Größen-Set eines Bildes im Behold-Feed. */
interface BeholdSizes {
  small?: BeholdSize;
  medium?: BeholdSize;
  large?: BeholdSize;
  full?: BeholdSize;
}

/** Einzelbild eines CAROUSEL_ALBUM (children-Eintrag). */
interface BeholdChild {
  id?: string;
  mediaUrl?: string;
  mediaType?: string;
  sizes?: BeholdSizes;
}

/** Rohform eines Posts aus dem Behold-JSON – nur die genutzten Felder. */
interface BeholdRawPost {
  id: string;
  permalink: string;
  mediaUrl: string;
  mediaType: string;
  timestamp: string;
  caption?: string;
  prunedCaption?: string;
  sizes?: BeholdSizes;
  /** Nur bei CAROUSEL_ALBUM: alle Bilder des Posts in Reihenfolge. */
  children?: BeholdChild[];
}

/**
 * Wählt die stabile behold.pictures-URL eines Bildes (large → medium → full);
 * die rohe cdninstagram-mediaUrl nur als letzter Ausweg, da sie abläuft.
 * large (1000 px) reicht für die Card-Darstellung und spart Bandbreite.
 */
function pickImage(
  sizes: BeholdSizes | undefined,
  fallbackUrl: string | undefined,
): InstaImage | null {
  const size = sizes?.large ?? sizes?.medium ?? sizes?.full;
  if (size) {
    return { url: size.mediaUrl, width: size.width, height: size.height };
  }
  return fallbackUrl ? { url: fallbackUrl } : null;
}

interface BeholdFeed {
  posts?: BeholdRawPost[];
}

/**
 * Lädt die neuesten Instagram-Posts aus dem Behold-Feed und bringt sie in die
 * gemeinsame InstaPost-Struktur. Bei jedem Fehler wird ein leeres Array
 * zurückgegeben, damit der Build/Render der Seite nie crasht – die Varianten
 * zeigen dann ihren leeren Zustand.
 *
 * @param limit Maximale Anzahl Posts (Default 6 – alle Varianten zeigen 6).
 */
export async function getInstagramPosts(limit = 6): Promise<InstaPost[]> {
  const feedUrl = process.env.BEHOLD_FEED_URL;

  if (!feedUrl) {
    console.error("[beholdFeed] BEHOLD_FEED_URL ist nicht gesetzt.");
    return [];
  }

  try {
    const res = await fetch(feedUrl, {
      // 1 Stunde Caching – schont das Behold-Free-Tier-Kontingent.
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.error(`[beholdFeed] Feed-Abruf fehlgeschlagen: HTTP ${res.status}`);
      return [];
    }

    const data: BeholdFeed = await res.json();
    const posts = data.posts ?? [];

    return posts.slice(0, limit).map((post) => {
      const mainImage = pickImage(post.sizes, post.mediaUrl);

      // CAROUSEL_ALBUM: alle children mappen (je eigenes sizes-Set);
      // sonst einelementiges Array mit dem Hauptbild.
      const childImages = (post.children ?? [])
        .map((child) => pickImage(child.sizes, child.mediaUrl))
        .filter((img): img is InstaImage => img !== null);

      const images =
        childImages.length > 0 ? childImages : mainImage ? [mainImage] : [];

      return {
        id: post.id,
        permalink: post.permalink,
        // Stabile, von Behold gehostete Bild-URL bevorzugen (large → medium → full),
        // erst als letzter Ausweg die ablaufende Instagram-CDN-URL.
        imageUrl: mainImage?.url ?? post.mediaUrl,
        images,
        caption: post.caption ?? post.prunedCaption ?? "",
        timestamp: post.timestamp,
        mediaType: post.mediaType,
      };
    });
  } catch (err) {
    console.error("[beholdFeed] Unerwarteter Fehler beim Feed-Abruf:", err);
    return [];
  }
}

/** Eine Caption aufgeteilt in Überschrift (erste Zeile) und Fließtext. */
export interface CaptionParts {
  heading: string;
  body: string;
}

/**
 * Trennt die erste Zeile einer Instagram-Caption als Überschrift ab und behält
 * die übrigen Absätze als Fließtext (Absatzgrenzen via doppeltem Zeilenumbruch).
 *
 * Instagram-Captions enthalten echte \n-Umbrüche; ohne diese Aufbereitung
 * (und CSS `whitespace-pre-line`) liefen alle Absätze als ein Block zusammen.
 */
export function splitCaption(caption: string): CaptionParts {
  // An Zeilenumbrüchen trennen, leere Zeilen verwerfen → einzelne Absätze.
  const paragraphs = caption
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return { heading: "", body: "" };

  const [heading, ...rest] = paragraphs;
  // Restliche Absätze mit Leerzeile dazwischen zusammenfügen (pre-line rendert sie sichtbar).
  return { heading, body: rest.join("\n\n") };
}

/**
 * Formatiert einen ISO-Zeitstempel ins deutsche Datumsformat, z. B. „20. Mai 2026".
 * Wird von allen Varianten genutzt, damit die Datumsanzeige einheitlich ist.
 */
export function formatPostDate(timestamp: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}
