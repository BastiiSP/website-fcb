import { createClient } from "@/lib/supabaseClient";

export async function GET() {
  const supabase = createClient();
  
  // Einfache Abfrage, um die Datenbank aktiv zu halten
  const { error } = await supabase.from("profiles").select("id").limit(1);

  if (error) {
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }

  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}