import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Fallback-Werte verhindern einen Build-Fehler auf Preview-Branches die keine
// Supabase-Env-Vars gesetzt haben (z.B. design-variants). Auf main/production
// sind immer echte Werte gesetzt – die Fallbacks werden dort nie verwendet.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

// Singleton-Instanz – verhindert "Multiple GoTrueClient instances"-Warnung
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Accept: "application/json",
    },
  },
});

// Gibt immer dieselbe Instanz zurück (kein neues Client-Objekt pro Aufruf)
export const createClient = () => supabase;