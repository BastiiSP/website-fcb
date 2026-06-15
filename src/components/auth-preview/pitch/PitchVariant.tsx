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
import RotatingText from "@/components/hero/RotatingText";
import PitchBackground from "./PitchBackground";

/**
 * Variante "pitch" – die atmosphärischste Interpretation aus dem FCB-Vokabular.
 *
 * Gestapelte Layer (PitchBackground): Dot-Grid + einzeichnendes Spielfeld +
 * Vignette. Darüber eine Glas-Card mit Wappen-Glow-Header, rotierendem
 * Schlagwort (RotatingText) und dem "1911 / Schuhstädter"-Motiv. Die
 * Eingangs-Choreografie nutzt gestaffelte Framer-Motion-Delays und wird bei
 * reduzierter Bewegung komplett abgeschaltet.
 *
 * Wiederverwendete Vokabular-Elemente (≥3):
 *   1. HybridCanvas (Dot-Grid)   – via PitchBackground
 *   2. HybridPitch (Spielfeld)   – via PitchBackground
 *   3. Wappen-Glow-Motiv         – Header der Card
 *   4. RotatingText              – rotierendes Schlagwort
 *   5. "1911 / Schuhstädter"-Motiv – Divider unter dem Wappen
 *
 * Standalone – Navbar/Footer werden von der Preview-Route ausgeblendet.
 */
export default function PitchVariant({ screen, onNavigate }: AuthVariantProps) {
  const { login, register, google } = useAuthMock({
    onRegistered: () => onNavigate("confirm"),
  });
  const reduzierteBewegung = useReducedMotion();

  // Gestaffelte Eingangs-Choreografie. Bei reduzierter Bewegung leerer Wrapper,
  // damit Inhalte ohne Animation sofort sichtbar sind.
  const containerMotion = reduzierteBewegung
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: {
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        },
      };

  // Einzelnes Item der Staffelung – ebenfalls neutralisiert bei reduzierter Bewegung.
  const itemMotion = reduzierteBewegung
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 14 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.45, ease: "easeOut" as const },
          },
        },
      };

  return (
    <div className="relative min-h-screen overflow-hidden bg-fcb-bg">
      {/* Gestapelte Hintergrund-Layer */}
      <PitchBackground />

      {/* Inhalt über den Layern */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <motion.div
          {...containerMotion}
          className="w-full max-w-md rounded-2xl border border-fcb-border bg-fcb-surface/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          {/* Wappen-Glow-Header */}
          <motion.div {...itemMotion} className="flex flex-col items-center text-center">
            <div className="relative">
              {/* Radialer Blau-Glow hinter dem Wappen */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 scale-150 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(29,95,173,0.55) 0%, rgba(29,95,173,0) 70%)",
                }}
              />
              <Image
                src="/logo.svg"
                alt="1. FC 1911 Burgkunstadt"
                width={72}
                height={72}
                priority
                className="h-16 w-16 drop-shadow-[0_0_24px_rgba(29,95,173,0.6)] sm:h-20 sm:w-20"
              />
            </div>

            {/* "1911 / Schuhstädter"-Divider-Motiv */}
            <div className="mt-4 flex items-center gap-3">
              <span className="h-0.5 w-12 bg-white/30" aria-hidden="true" />
              <span className="font-oswald text-xs uppercase tracking-[0.2em] text-fcb-muted">
                <span className="text-fcb-blue">1911</span> Schuhstädter
              </span>
              <span className="h-0.5 w-12 bg-white/30" aria-hidden="true" />
            </div>
          </motion.div>

          {/* --- LOGIN --- */}
          {screen === "login" && (
            <form onSubmit={login.handleSubmit} className="mt-7 space-y-5">
              <motion.div {...itemMotion} className="text-center">
                <h1 className="font-oswald text-3xl font-bold uppercase tracking-wide text-fcb-text">
                  Willkommen zurück
                </h1>
                {/* Rotierendes Schlagwort */}
                <p className="mt-1 font-inter text-sm text-fcb-muted">
                  Dein Verein, deine{" "}
                  <RotatingText
                    words={["Tradition", "Heimat", "Mannschaft", "1911"]}
                    className="font-oswald font-semibold uppercase tracking-wide text-fcb-blue"
                  />
                </p>
              </motion.div>

              <motion.div {...itemMotion} className="space-y-4">
                <GoogleButton modus="login" onClick={google.handleClick} />
                <AuthInfoBanner message={google.info} />
                <AuthDivider />
                <AuthTextField
                  label="E-Mail"
                  type="email"
                  value={login.email}
                  onChange={login.setEmail}
                  autoComplete="email"
                  required
                />
                <AuthPasswordField
                  label="Passwort"
                  value={login.password}
                  onChange={login.setPassword}
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
              </motion.div>
            </form>
          )}

          {/* --- REGISTER --- */}
          {screen === "register" && (
            <form onSubmit={register.handleSubmit} className="mt-7 space-y-5">
              <motion.div {...itemMotion} className="text-center">
                <h1 className="font-oswald text-3xl font-bold uppercase tracking-wide text-fcb-text">
                  Werde Teil des Vereins
                </h1>
                <p className="mt-1 font-inter text-sm text-fcb-muted">
                  Anmelden und dabei sein – seit{" "}
                  <span className="font-oswald font-semibold uppercase tracking-wide text-fcb-blue">
                    1911
                  </span>
                </p>
              </motion.div>

              <motion.div {...itemMotion} className="space-y-4">
                <GoogleButton modus="register" onClick={google.handleClick} />
                <AuthInfoBanner message={google.info} />
                <AuthDivider />

                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthTextField
                    label="Vorname"
                    value={register.vorname}
                    onChange={register.setVorname}
                    autoComplete="given-name"
                    required
                  />
                  <AuthTextField
                    label="Nachname"
                    value={register.nachname}
                    onChange={register.setNachname}
                    autoComplete="family-name"
                    required
                  />
                </div>

                <AuthTextField
                  label="Telefonnummer"
                  type="tel"
                  value={register.telefonnummer}
                  onChange={register.setTelefonnummer}
                  autoComplete="tel"
                  optional
                />
                <AuthTextField
                  label="E-Mail"
                  type="email"
                  value={register.email}
                  onChange={register.setEmail}
                  autoComplete="email"
                  required
                />
                <AuthPasswordField
                  label="Passwort"
                  value={register.passwort}
                  onChange={register.setPasswort}
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
              </motion.div>
            </form>
          )}

          {/* --- CONFIRM --- */}
          {screen === "confirm" && (
            <div className="mt-7 flex flex-col items-center text-center">
              <motion.div
                {...itemMotion}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-fcb-blue/40 bg-fcb-blue/10 text-fcb-blue"
              >
                <MailCheck className="h-8 w-8" aria-hidden="true" />
              </motion.div>

              <motion.h1
                {...itemMotion}
                className="mt-5 font-oswald text-3xl font-bold uppercase tracking-wide text-fcb-text"
              >
                Fast geschafft
              </motion.h1>

              <motion.p {...itemMotion} className="mt-3 font-inter text-sm leading-relaxed text-fcb-muted">
                Wir haben dir eine Bestätigungs-E-Mail
                {register.email ? (
                  <>
                    {" "}
                    an <span className="text-fcb-text">{register.email}</span>
                  </>
                ) : null}{" "}
                geschickt. Bitte klicke den Link in der Mail. Anschließend prüft
                der Vorstand dein Konto und schaltet es frei.
              </motion.p>

              <motion.div {...itemMotion} className="mt-5 w-full">
                <AuthInfoBanner message="Keine Mail erhalten? Schau im Spam-Ordner nach." />
              </motion.div>

              <motion.div {...itemMotion} className="mt-6">
                <Link
                  href="/"
                  className="font-inter text-sm font-medium text-fcb-blue underline-offset-2 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
                >
                  Zur Startseite
                </Link>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
