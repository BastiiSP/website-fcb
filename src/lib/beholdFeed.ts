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

/** Aufbereiteter Instagram-Post – das ist die gemeinsame Struktur für alle Varianten. */
export interface InstaPost {
  id: string;
  /** Permalink zum Original-Post auf Instagram (öffnet in neuem Tab). */
  permalink: string;
  /** Stabile Bild-URL (behold.pictures), nicht die ablaufende Instagram-CDN-URL. */
  imageUrl: string;
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

/** Rohform eines Posts aus dem Behold-JSON – nur die genutzten Felder. */
interface BeholdRawPost {
  id: string;
  permalink: string;
  mediaUrl: string;
  mediaType: string;
  timestamp: string;
  caption?: string;
  prunedCaption?: string;
  sizes?: {
    small?: BeholdSize;
    medium?: BeholdSize;
    large?: BeholdSize;
    full?: BeholdSize;
  };
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

    return posts.slice(0, limit).map((post) => ({
      id: post.id,
      permalink: post.permalink,
      // Stabile, von Behold gehostete Bild-URL bevorzugen (large → medium → full),
      // erst als letzter Ausweg die ablaufende Instagram-CDN-URL.
      imageUrl:
        post.sizes?.large?.mediaUrl ??
        post.sizes?.medium?.mediaUrl ??
        post.sizes?.full?.mediaUrl ??
        post.mediaUrl,
      caption: post.caption ?? post.prunedCaption ?? "",
      timestamp: post.timestamp,
      mediaType: post.mediaType,
    }));
  } catch (err) {
    console.error("[beholdFeed] Unerwarteter Fehler beim Feed-Abruf:", err);
    return [];
  }
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
