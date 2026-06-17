import { createClient } from "@/lib/supabaseClient";

/**
 * Startet den Google-OAuth-Flow. Nach erfolgreicher Anmeldung leitet Google
 * zurück auf /auth/callback. Origin-relativ, damit lokal, Vercel-Preview und
 * Produktion jeweils auf die richtige Domain zeigen.
 *
 * Solange der Google-Provider im Supabase-Dashboard noch nicht aktiviert ist,
 * liefert Supabase hier ein { error } zurück – die aufrufende Seite zeigt dann
 * einen freundlichen Hinweis statt eines echten Redirects.
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
