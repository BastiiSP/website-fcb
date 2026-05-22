import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Holt die Rolle des Nutzers anhand der User-ID aus der Tabelle "profile".
 * Gibt die Rolle als String zurück oder null, wenn keine gefunden wurde.
 *
 * @param supabase - SupabaseClient-Instanz
 * @param userId - ID des aktuell eingeloggten Users
 * @returns Rolle des Users (z. B. "trainer", "platzwart", "vorstand") oder null
 */
export async function getUserRolle(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("rolle")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Fehler beim Abrufen der Rolle:", error.message);
    return null;
  }

  return data?.rolle ?? null;
}
