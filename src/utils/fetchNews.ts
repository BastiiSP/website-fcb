import { createClient } from "@/lib/supabaseClient";
import { XMLParser } from "fast-xml-parser";

// Einheitlicher Typ für beide Quellen
export type NewsItem = {
  id: string | number;
  titel: string;
  teaser: string;
  inhalt?: string;
  bild_url: string;
  kategorie: string;
  created_at: string;
  link: string;
};

// Bild aus <description> extrahieren – robust & serverseitig
function extractImageFromDescription(description: string): string | null {
  if (!description) return null;

  const matches = Array.from(description.matchAll(/<img[^>]+src=["']([^"']+)["']/gi));

  for (const match of matches) {
    const url = match[1];
    if (url && url.includes("cdninstagram")) {
      return url; // ✅ Priorisiere funktionierende CDN-Links
    }
  }

  // Wenn kein CDN-Link, nimm notfalls das erste Bild überhaupt
  return matches[0]?.[1] || null;
}


// Supabase-News laden
async function fetchSupabaseNews(): Promise<NewsItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, titel, teaser, inhalt, bild_url, kategorie, created_at")
    .eq("veröffentlicht", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("❌ Fehler beim Laden der Supabase-News:", error);
    return [];
  }

  return (data as NewsItem[]).map((item) => ({ ...item, link: "" }));
}

// Instagram-News aus RSS
async function fetchInstagramNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("/api/instagram-feed");
    const { xml } = await res.json();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      processEntities: true,
    });

    const parsed = parser.parse(xml);
    const items = parsed.rss?.channel?.item || [];

    interface RssItem {
      title?: string;
      description?: string;
      pubDate?: string;
      link?: string;
    }

    return items.slice(0, 3).map((item: RssItem, index: number) => {
      const imageUrl = extractImageFromDescription(item.description || "")?.trim() || "";

      return {
        id: `ig-${index}`,
        titel: item.title || "Instagram-Beitrag",
        teaser:
          (item.description?.replace(/<[^>]+>/g, "").slice(0, 150) + "…") ||
          "Neuer Beitrag auf Instagram.",
        bild_url: imageUrl,
        kategorie: "Instagram",
        created_at: item.pubDate || new Date().toISOString(),
        link: item.link || "",
      };
    });
  } catch (error) {
    console.error("❌ Fehler beim Laden des Instagram-Feeds:", error);
    return [];
  }
}

// Kombinierte Hauptfunktion
export async function fetchNews(): Promise<NewsItem[]> {
  const [supabaseNews, instagramNews] = await Promise.all([
    fetchSupabaseNews(),
    fetchInstagramNews(),
  ]);

  const combined = [...supabaseNews, ...instagramNews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return combined.slice(0, 3); // maximal 3 Beiträge
}
