"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import { useTenant } from "@/components/tenant/TenantProvider";

/**
 * OAuth-Callback. Der Supabase-Client parst Token/Code beim Initialisieren
 * automatisch (detectSessionInUrl=Default). Sobald eine Session vorliegt, wird
 * die Rolle geladen und rollenbasiert weitergeleitet:
 *   - ausstehend → /profil (frischer Google-Nutzer soll Profil vervollständigen)
 *   - alle anderen → /
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  // Wappen pro Marke – der Callback ist die erste Seite nach dem Google-Login
  // und zeigte auf der JFG-Domain sonst das FCB-Wappen.
  const tenant = useTenant();

  useEffect(() => {
    const supabase = createClient();

    const weiterleiten = async () => {
      const { userId, rolle } = await checkSession(supabase);
      if (!userId) return; // noch keine Session – auf Auth-Event warten
      router.replace(rolle === "ausstehend" ? "/profil" : "/");
    };

    // Falls die Session beim Laden bereits steht:
    void weiterleiten();

    // Andernfalls auf das SIGNED_IN-Event warten.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void weiterleiten();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fcb-bg">
      <Image
        src={tenant.logoSrc}
        alt={tenant.logoAlt}
        width={64}
        height={64}
        priority
        className="h-16 w-16 animate-pulse object-contain"
      />
      <p className="font-inter text-sm text-fcb-muted">Anmeldung wird abgeschlossen…</p>
    </main>
  );
}
