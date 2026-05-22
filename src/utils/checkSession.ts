import { createClient } from "@/lib/supabaseClient";

/**
 * Holt die Session und Rolle des aktuellen Nutzers.
 * Gibt userId, Rolle und E-Mail zurück – oder null-Werte bei fehlender Session.
 */
export async function checkSession(supabase: ReturnType<typeof createClient>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

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
