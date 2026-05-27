import { createClient } from "@/lib/supabaseClient";

/**
 * Holt den aktuellen Nutzer (serverseitig validiert) und seine Rolle.
 * Gibt userId, Rolle und E-Mail zurück – oder null-Werte bei fehlender Session.
 *
 * Warum getUser() statt getSession(): getSession() liest den lokal gecachten JWT,
 * der nach einer E-Mail-Änderung noch die alte Adresse enthalten kann. getUser()
 * validiert das Token gegen den Auth-Server und liefert immer aktuelle Daten.
 */
export async function checkSession(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, rolle: null, userEmail: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("rolle")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("❌ Fehler beim Abrufen der Rolle:", error.message);
  }

  return {
    userId: user.id,
    rolle: profile?.rolle || null,
    userEmail: user.email ?? null,
  };
}
