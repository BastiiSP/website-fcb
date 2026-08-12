import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Ungültige userId" }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Serverkonfiguration fehlt" },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  // Auth-Check: Ohne gültigen Access-Token darf niemand diese Route aufrufen.
  // (Sicherheitsfix 2026-08-12 – Route hatte vorher gar keinen Auth-Check und
  // konnte von jedem, der die URL kennt, zum Löschen beliebiger Accounts
  // missbraucht werden.)
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const {
    data: { user: aufrufer },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !aufrufer) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  // Rollen-Check: Nur vorstand/admin dürfen Accounts ablehnen/löschen.
  const { data: aufruferProfil, error: profilError } = await supabaseAdmin
    .from("profiles")
    .select("rolle")
    .eq("id", aufrufer.id)
    .single();

  if (profilError || !aufruferProfil) {
    return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 403 });
  }

  if (aufruferProfil.rolle !== "vorstand" && aufruferProfil.rolle !== "admin") {
    return NextResponse.json(
      { error: "Keine Berechtigung für diese Aktion" },
      { status: 403 }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
