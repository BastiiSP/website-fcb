import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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