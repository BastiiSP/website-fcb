"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { useAuthMock } from "../_shared/useAuthMock";
import type { AuthVariantProps } from "../_shared/types";
import GoogleButton from "../_shared/GoogleButton";
import AuthDivider from "../_shared/AuthDivider";
import AuthTextField from "../_shared/AuthTextField";
import AuthPasswordField from "../_shared/AuthPasswordField";
import PasswordStrengthMeter from "../_shared/PasswordStrengthMeter";
import AuthSubmitButton from "../_shared/AuthSubmitButton";
import AuthErrorBanner from "../_shared/AuthErrorBanner";
import AuthInfoBanner from "../_shared/AuthInfoBanner";
import AuthSwitchPrompt from "../_shared/AuthSwitchPrompt";

/**
 * Variante "split": räumliche Trennung von Branding und Formular.
 * Desktop (lg+): zweispaltiges Vollbild-Grid – links Branding-Panel mit Wappen,
 * "1911 / Schuhstädter"-Wortmarke und Tagline auf dezentem dunklem Verlauf mit
 * angedeuteten Spielfeld-Linien; rechts vertikal zentriertes Formular-Panel.
 * Mobile (< lg): das Branding-Panel klappt zu einem kompakten Top-Header zusammen,
 * darunter folgt einspaltig das Formular. Standalone – die Preview-Route blendet
 * Navbar/Footer aus.
 */
export default function SplitVariant({ screen, onNavigate }: AuthVariantProps) {
  const { login, register, google } = useAuthMock({
    onRegistered: () => onNavigate("confirm"),
  });
  const reduzierteBewegung = useReducedMotion();

  // Einblendung des Formular-Panels – bei reduzierter Bewegung ohne Animation.
  const formMotion = reduzierteBewegung
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" as const },
      };

  // Einblendung des Branding-Panels (nur Desktop sichtbar) – ebenfalls bewegungssensibel.
  const brandMotion = reduzierteBewegung
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  return (
    <div className="grid min-h-screen bg-fcb-bg lg:grid-cols-2">
      {/* LINKS / OBEN: Branding-Panel.
          Auf Mobile ein kompakter Top-Header (Wappen + Wortmarke),
          ab lg ein vollhohes Panel mit Spielfeld-Anmutung und Tagline. */}
      <motion.aside
        {...brandMotion}
        className="relative flex items-center justify-center overflow-hidden border-b border-fcb-border bg-fcb-surface px-6 py-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-16"
      >
        {/* Dezente Spielfeld-/Glow-Anmutung – nur auf dem großen Panel sichtbar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(29,95,173,0.18), transparent 55%)",
          }}
        />
        {/* Angedeutete Mittellinie + Mittelkreis als feine Linien. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-fcb-border lg:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 hidden h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full border border-fcb-border lg:block"
        />

        {/* Branding-Inhalt: kompakt horizontal auf Mobile, gestapelt auf Desktop. */}
        <div className="relative z-10 flex w-full max-w-sm items-center gap-4 lg:flex-col lg:items-start lg:gap-6">
          <Image
            src="/logo.svg"
            alt="Wappen 1. FC 1911 Burgkunstadt"
            width={72}
            height={72}
            className="h-12 w-12 shrink-0 lg:h-20 lg:w-20"
            priority
          />

          {/* Wortmarke "1911 / Schuhstädter" mit feinen Trennstrichen. */}
          <div className="lg:space-y-4">
            <div className="font-oswald text-2xl font-bold uppercase leading-none tracking-wide text-fcb-text lg:text-4xl">
              <span className="text-fcb-blue">1911</span>
            </div>
            <div className="hidden h-0.5 w-12 bg-white/30 lg:block" />
            <div className="font-oswald text-sm font-medium uppercase tracking-[0.2em] text-fcb-muted lg:text-base">
              Schuhstädter
            </div>
            {/* Tagline nur auf dem großen Panel – auf Mobile wäre sie überflüssig. */}
            <p className="hidden max-w-xs font-inter text-sm leading-relaxed text-fcb-muted lg:block">
              Dein Zugang zum Vereinsbereich des 1. FC 1911 Burgkunstadt –
              Buchungen, Mannschaften und alles rund um den Verein.
            </p>
          </div>
        </div>
      </motion.aside>

      {/* RECHTS / UNTEN: Formular-Panel, vertikal zentriert. */}
      <main className="flex items-center justify-center bg-fcb-bg px-5 py-12 lg:px-12 lg:py-16">
        <motion.div {...formMotion} className="w-full max-w-md">
          {screen === "login" && (
            <form onSubmit={login.handleSubmit} className="space-y-5">
              <h1 className="font-oswald text-3xl font-semibold uppercase tracking-wide text-fcb-text">
                Anmelden
              </h1>
              <GoogleButton modus="login" onClick={google.handleClick} />
              <AuthInfoBanner message={google.info} />
              <AuthDivider />
              <AuthTextField
                label="E-Mail"
                type="email"
                value={login.email}
                onChange={login.setEmail}
                placeholder="name@beispiel.de"
                autoComplete="email"
                required
              />
              <AuthPasswordField
                label="Passwort"
                value={login.password}
                onChange={login.setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <AuthInfoBanner message={login.info} />
              <AuthSubmitButton>Einloggen</AuthSubmitButton>
              <AuthSwitchPrompt
                frage="Noch kein Konto?"
                aktion="Jetzt registrieren"
                ziel="register"
                onNavigate={onNavigate}
              />
            </form>
          )}

          {screen === "register" && (
            <form onSubmit={register.handleSubmit} className="space-y-5">
              <h1 className="font-oswald text-3xl font-semibold uppercase tracking-wide text-fcb-text">
                Registrieren
              </h1>
              <GoogleButton modus="register" onClick={google.handleClick} />
              <AuthInfoBanner message={google.info} />
              <AuthDivider />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AuthTextField
                  label="Vorname"
                  value={register.vorname}
                  onChange={register.setVorname}
                  required
                  autoComplete="given-name"
                />
                <AuthTextField
                  label="Nachname"
                  value={register.nachname}
                  onChange={register.setNachname}
                  required
                  autoComplete="family-name"
                />
              </div>
              <AuthTextField
                label="Telefonnummer"
                type="tel"
                value={register.telefonnummer}
                onChange={register.setTelefonnummer}
                optional
                autoComplete="tel"
              />
              <AuthTextField
                label="E-Mail"
                type="email"
                value={register.email}
                onChange={register.setEmail}
                placeholder="name@beispiel.de"
                required
                autoComplete="email"
              />
              <AuthPasswordField
                label="Passwort"
                value={register.passwort}
                onChange={register.setPasswort}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <PasswordStrengthMeter feedback={register.feedback} staerke={register.staerke} />
              <AuthPasswordField
                label="Passwort bestätigen"
                value={register.passwortBestaetigung}
                onChange={register.setPasswortBestaetigung}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <AuthErrorBanner message={register.fehler} />
              <AuthSubmitButton disabled={!register.gueltig}>
                Jetzt registrieren
              </AuthSubmitButton>
              <AuthSwitchPrompt
                frage="Bereits registriert?"
                aktion="Hier einloggen"
                ziel="login"
                onNavigate={onNavigate}
              />
            </form>
          )}

          {screen === "confirm" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-fcb-blue/40 bg-fcb-blue/10">
                <MailCheck size={26} className="text-fcb-blue" />
              </div>
              <h1 className="font-oswald text-3xl font-semibold uppercase tracking-wide text-fcb-text">
                Fast geschafft
              </h1>
              <p className="font-inter text-sm text-fcb-muted">
                Wir haben dir eine Bestätigungs-E-Mail
                {register.email ? (
                  <> an <span className="text-fcb-text">{register.email}</span></>
                ) : null}{" "}
                geschickt. Bitte klicke den Link in der Mail. Anschließend prüft der
                Vorstand dein Konto und schaltet es frei.
              </p>
              <AuthInfoBanner message="Keine Mail erhalten? Schau im Spam-Ordner nach." />
              <Link
                href="/"
                className="inline-block font-inter text-sm font-medium text-fcb-blue underline-offset-2 transition-colors hover:underline"
              >
                Zur Startseite
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
