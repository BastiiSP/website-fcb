import { NextResponse } from "next/server";
import { getInstagramPosts } from "@/lib/beholdFeed";

/**
 * Gemeinsamer API-Endpoint für die Instagram-Carousel-Varianten.
 *
 * Liefert die aufbereiteten Posts als JSON. Die Varianten-Seiten selbst nutzen
 * getInstagramPosts() direkt (Server Components), dieser Endpoint dient als
 * gemeinsamer Debug-/Fallback-Zugang und macht die Datenquelle inspizierbar.
 *
 * revalidate = 3600 → 1 Stunde Caching (Behold Free-Tier schonen).
 */
export const revalidate = 3600;

export async function GET() {
  const posts = await getInstagramPosts();
  return NextResponse.json(posts);
}
