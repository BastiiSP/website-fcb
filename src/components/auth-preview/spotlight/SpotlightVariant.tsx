"use client";

import Link from "next/link";
import { useCallback } from "react";
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
import SpotlightBackground from "./SpotlightBackground";

/**
 * Variante "spotlight": dominantes Hintergrund-Visual (übergroßes Wappen +
 * Lichtkegel) mit einer kompakten, schwebenden Glas-Card darüber. Die Card
 * trägt einen mausfolgenden Blau-Glow (Desktop) über die globalen
 * .spotlight-*-Klassen. Standalone – Navbar/Footer werden von der Preview-
 * Route ausgeblendet.
 */
export default function SpotlightVariant({ screen, onNavigate }: AuthVariantProps) {
  const { login, register, google } = useAuthMock({
    onRegistered: () => onNavigate("confirm"),
  });
  const reduzierteBewegung = useReducedMotion();

  // Setzt die CSS-Variablen --mx/--my auf die lokale Cursor-Position der Card.
  // Auf Touch/ohne Hover wird der Handler praktisch nie relevant – die
  // .spotlight-*-Klassen zeigen den Glow nur bei :hover, daher kein Risiko.
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    [],
  );

  // Card-Einblendung – bei reduzierter Bewegung ohne Eingangsanimation.
  const cardMotion = reduzierteBewegung
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.5, ease: "easeOut" as const },
      };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <SpotlightBackground />

      <motion.div
        {...cardMotion}
        onMouseMove={handleMouseMove}
        className="spotlight-card relative z-10 w-full max-w-sm rounded-2xl border border-fcb-border bg-fcb-surface/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        // Grund-Glow, damit die Card auch ohne Hover „schwebt".
        style={{ boxShadow: "0 24px 60px -20px rgba(29,95,173,0.45)" }}
      >
        {/* Mausfolgende Glow-Layer (Rand + Lichtkegel) – siehe globals.css */}
        <span className="spotlight-border" aria-hidden="true" />
        <span className="spotlight-fill" aria-hidden="true" />

        {/* Inhalt muss über den z-5/z-40-Glow-Layern liegen */}
        <div className="relative z-50">
          {screen === "login" && (
            <form onSubmit={login.handleSubmit} className="space-y-5">
              <h1 className="text-center font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
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
              <h1 className="text-center font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
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
              <PasswordStrengthMeter
                feedback={register.feedback}
                staerke={register.staerke}
              />
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
              <h1 className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
                Fast geschafft
              </h1>
              <p className="font-inter text-sm text-fcb-muted">
                Wir haben dir eine Bestätigungs-E-Mail
                {register.email ? (
                  <>
                    {" "}
                    an <span className="text-fcb-text">{register.email}</span>
                  </>
                ) : null}{" "}
                geschickt. Bitte klicke den Link in der Mail. Anschließend prüft
                der Vorstand dein Konto und schaltet es frei.
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
        </div>
      </motion.div>
    </div>
  );
}
