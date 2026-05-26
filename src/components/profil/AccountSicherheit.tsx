"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  berechnePasswortFeedback,
  berechnePasswortStaerke,
  passwortStaerkeLabel,
  passwortStaerkefarbe,
  type PasswortFeedback,
} from "@/utils/passwortStaerke";

interface AccountSicherheitProps {
  aktuelleEmail: string;
}

export default function AccountSicherheit({ aktuelleEmail }: AccountSicherheitProps) {
  const supabase = createClient();

  // E-Mail ändern
  const [neueEmail, setNeueEmail] = useState("");
  const [emailLaden, setEmailLaden] = useState(false);
  const [emailFehler, setEmailFehler] = useState("");
  const [emailErfolg, setEmailErfolg] = useState("");

  // Passwort ändern
  const [aktuellesPasswort, setAktuellesPasswort] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [passwortBestaetigung, setPasswortBestaetigung] = useState("");
  const [passwortAnzeigen, setPasswortAnzeigen] = useState(false);
  const [passwortLaden, setPasswortLaden] = useState(false);
  const [passwortFehler, setPasswortFehler] = useState("");
  const [passwortErfolg, setPasswortErfolg] = useState("");

  const [passwortFeedback, setPasswortFeedback] = useState<PasswortFeedback>({
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSymbol: false,
    hasMinLength: false,
  });
  const [passwortStaerke, setPasswortStaerke] = useState(0);

  const handleNeuesPasswortChange = (value: string) => {
    setNeuesPasswort(value);
    const feedback = berechnePasswortFeedback(value);
    setPasswortFeedback(feedback);
    setPasswortStaerke(berechnePasswortStaerke(feedback));
  };

  const handleEmailAendern = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFehler("");
    setEmailErfolg("");
    setEmailLaden(true);

    if (!neueEmail.trim()) {
      setEmailFehler("Bitte gib eine neue E-Mail-Adresse ein.");
      setEmailLaden(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: neueEmail.trim() });

    if (error) {
      setEmailFehler("Fehler beim Ändern der E-Mail: " + error.message);
    } else {
      setEmailErfolg(
        `Eine Bestätigungsmail wurde an ${neueEmail} geschickt. Bitte klicke den Link in der Mail.`
      );
      setNeueEmail("");
    }
    setEmailLaden(false);
  };

  const handlePasswortAendern = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswortFehler("");
    setPasswortErfolg("");
    setPasswortLaden(true);

    if (neuesPasswort !== passwortBestaetigung) {
      setPasswortFehler("Die neuen Passwörter stimmen nicht überein.");
      setPasswortLaden(false);
      return;
    }

    if (passwortStaerke < 3) {
      setPasswortFehler("Das neue Passwort ist zu schwach. Bitte wähle ein stärkeres.");
      setPasswortLaden(false);
      return;
    }

    // Re-Authentifizierung mit aktuellem Passwort vor der Änderung
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: aktuelleEmail,
      password: aktuellesPasswort,
    });

    if (reAuthError) {
      setPasswortFehler("Das aktuelle Passwort ist falsch.");
      setPasswortLaden(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: neuesPasswort });

    if (error) {
      setPasswortFehler("Fehler beim Ändern des Passworts: " + error.message);
    } else {
      setPasswortErfolg("Passwort erfolgreich geändert.");
      setAktuellesPasswort("");
      setNeuesPasswort("");
      setPasswortBestaetigung("");
      setPasswortStaerke(0);
      setPasswortFeedback({
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSymbol: false,
        hasMinLength: false,
      });
    }
    setPasswortLaden(false);
  };

  return (
    <div className="space-y-10">
      {/* E-Mail ändern */}
      <section>
        <h2 className="text-base font-semibold mb-1">E-Mail-Adresse ändern</h2>
        <p className="text-sm opacity-60 mb-4">
          Aktuell: <strong>{aktuelleEmail}</strong>
        </p>

        {emailFehler && (
          <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50 mb-3">
            {emailFehler}
          </p>
        )}
        {emailErfolg && (
          <p className="text-green-700 text-sm p-3 border border-green-300 rounded bg-green-50 mb-3">
            {emailErfolg}
          </p>
        )}

        <form onSubmit={handleEmailAendern} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Neue E-Mail-Adresse</label>
            <input
              type="email"
              value={neueEmail}
              onChange={(e) => setNeueEmail(e.target.value)}
              placeholder="neue@email.de"
              required
              className="form-field"
            />
          </div>
          <button
            type="submit"
            disabled={emailLaden}
            className="px-5 py-2 bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-80 transition disabled:opacity-50"
          >
            {emailLaden ? "Wird gesendet …" : "Bestätigungsmail senden"}
          </button>
        </form>
      </section>

      {/* Passwort ändern */}
      <section>
        <h2 className="text-base font-semibold mb-4">Passwort ändern</h2>

        {passwortFehler && (
          <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50 mb-3">
            {passwortFehler}
          </p>
        )}
        {passwortErfolg && (
          <p className="text-green-700 text-sm p-3 border border-green-300 rounded bg-green-50 mb-3">
            {passwortErfolg}
          </p>
        )}

        <form onSubmit={handlePasswortAendern} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aktuelles Passwort</label>
            <input
              type={passwortAnzeigen ? "text" : "password"}
              value={aktuellesPasswort}
              onChange={(e) => setAktuellesPasswort(e.target.value)}
              required
              className="form-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort</label>
            <input
              type={passwortAnzeigen ? "text" : "password"}
              value={neuesPasswort}
              onChange={(e) => handleNeuesPasswortChange(e.target.value)}
              required
              className="form-field"
            />
            {/* Passwort-Stärke-Anzeige */}
            {neuesPasswort && (
              <div className="mt-2 space-y-1">
                <div className="text-sm space-y-0.5">
                  <div>{passwortFeedback.hasLower ? "✅" : "❌"} Kleinbuchstaben</div>
                  <div>{passwortFeedback.hasUpper ? "✅" : "❌"} Großbuchstaben</div>
                  <div>{passwortFeedback.hasNumber ? "✅" : "❌"} Zahl</div>
                  <div>{passwortFeedback.hasSymbol ? "✅" : "❌"} Sonderzeichen</div>
                  <div>{passwortFeedback.hasMinLength ? "✅" : "❌"} Mind. 8 Zeichen</div>
                </div>
                <div className="h-2 w-full rounded bg-gray-300 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${passwortStaerkefarbe(passwortStaerke)}`} />
                </div>
                <p className="text-xs">{passwortStaerkeLabel(passwortStaerke)}</p>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Neues Passwort bestätigen</label>
            <input
              type={passwortAnzeigen ? "text" : "password"}
              value={passwortBestaetigung}
              onChange={(e) => setPasswortBestaetigung(e.target.value)}
              required
              className="form-field pr-10"
            />
            {passwortBestaetigung && (
              <span className="absolute top-8 right-3">
                {neuesPasswort === passwortBestaetigung ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={passwortAnzeigen}
              onChange={() => setPasswortAnzeigen((prev) => !prev)}
            />
            Passwörter anzeigen
          </label>

          <button
            type="submit"
            disabled={passwortLaden}
            className="px-5 py-2 bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-80 transition disabled:opacity-50"
          >
            {passwortLaden ? "Wird geändert …" : "Passwort ändern"}
          </button>
        </form>
      </section>
    </div>
  );
}
