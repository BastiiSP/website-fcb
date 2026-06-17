"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PitchAuthShell from "@/components/auth/PitchAuthShell";
import AuthInfoBanner from "@/components/auth/AuthInfoBanner";

/**
 * Seite nach Klick auf den Bestätigungslink in der E-Mail. Supabase parst den
 * Token automatisch (detectSessionInUrl=Default). Der Nutzer ist hier i. d. R.
 * frisch eingeloggt → einladender, prominenter CTA zur Profilvervollständigung.
 */
export default function ConfirmEmailPage() {
  return (
    <PitchAuthShell>
      <div className="mt-7 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-fcb-blue/40 bg-fcb-blue/10 text-fcb-blue">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-oswald text-3xl font-bold uppercase tracking-wide text-fcb-text">
          Willkommen beim FCB
        </h1>
        <p className="mt-3 font-inter text-sm leading-relaxed text-fcb-muted">
          Deine E-Mail-Adresse wurde erfolgreich bestätigt. Dein Konto wird
          geprüft und freigeschaltet. Bei Fragen wende dich an die Vorstandschaft
          oder den IT-Verantwortlichen.
        </p>
        <div className="mt-5 w-full">
          <AuthInfoBanner message="Vervollständige schon jetzt dein Profil – so können wir dich schneller zuordnen und freischalten." />
        </div>
        {/* Einladender, prominenter CTA zur Profilvervollständigung */}
        <Link
          href="/profil"
          className="mt-6 w-full rounded-lg bg-fcb-blue px-4 py-3 text-center font-oswald text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-fcb-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-bg"
        >
          Profil vervollständigen
        </Link>
        <Link
          href="/"
          className="mt-3 font-inter text-sm font-medium text-fcb-muted underline-offset-2 transition-colors hover:text-fcb-text hover:underline"
        >
          Später, zur Startseite
        </Link>
      </div>
    </PitchAuthShell>
  );
}
