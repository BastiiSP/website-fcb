"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function Registrierungsseite() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [passwortBestaetigung, setPasswortBestaetigung] = useState("");
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [passwortAnzeigen, setPasswortAnzeigen] = useState(false);

  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");

  const [passwortStarke, setPasswortStarke] = useState(0);
  const [passwortFeedback, setPasswortFeedback] = useState({
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSymbol: false,
    hasMinLength: false,
  });

  const handlePasswortChange = (value: string) => {
    setPasswort(value);

    const feedback = {
      hasLower: /[a-z]/.test(value),
      hasUpper: /[A-Z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSymbol: /[^A-Za-z0-9]/.test(value),
      hasMinLength: value.length >= 8,
    };
    setPasswortFeedback(feedback);

    const score =
      Number(feedback.hasLower) +
      Number(feedback.hasUpper) +
      Number(feedback.hasNumber) +
      Number(feedback.hasSymbol) +
      Number(feedback.hasMinLength);
    setPasswortStarke(score);
  };

  const handleRegistrierung = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler("");
    setErfolg("");

    if (!vorname || !nachname) {
      setFehler("❌ Bitte Vor- und Nachname ausfüllen.");
      return;
    }

    if (passwort !== passwortBestaetigung) {
      setFehler("❌ Die Passwörter stimmen nicht überein.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: passwort,
      options: {
        emailRedirectTo: "https://www.fcbuku.de/confirm-email",
        data: {
          vorname,
          nachname,
          telefonnummer: telefonnummer || null,
        },
      },
    });

    if (error) {
      console.error("Supabase-Fehler:", error.message);
      setFehler(`❌ Registrierung fehlgeschlagen: ${error.message}`);
    } else {
      setErfolg(
        "✅ Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach."
      );
    }
  };

  const istFormularGueltig =
    email && passwort.length >= 6 && passwort === passwortBestaetigung;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#f9f9f9] p-6 rounded shadow mt-20">
        <h1 className="text-2xl font-bold text-center mb-4">📝 Registrieren</h1>
        <form onSubmit={handleRegistrierung} className="space-y-4">
          {/* Vorname / Nachname */}
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Vorname"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              className="flex-1 p-2 border rounded text-[var(--foreground)]"
            />
            <input
              type="text"
              placeholder="Nachname"
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              className="flex-1 p-2 border rounded text-[var(--foreground)]"
            />
          </div>

          {/* Telefonnummer */}
          <div>
            <input
              type="tel"
              placeholder="Telefonnummer (optional)"
              value={telefonnummer}
              onChange={(e) => setTelefonnummer(e.target.value)}
              className="w-full p-2 border rounded text-[var(--foreground)]"
            />
            <p className="text-xs text-gray-500 mt-1">
              ℹ️ Wird benötigt, um dich bei kurzfristigen Änderungen zu
              erreichen.
            </p>
          </div>

          {/* E-Mail */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
            required
            className="w-full p-2 border rounded text-[var(--foreground)]"
          />

          {/* Passwortfeld mit Live-Feedback */}
          <input
            type={passwortAnzeigen ? "text" : "password"}
            value={passwort}
            onChange={(e) => handlePasswortChange(e.target.value)}
            placeholder="Passwort"
            required
            className="w-full p-2 border rounded text-[var(--foreground)]"
          />

          <div className="text-sm mt-2 space-y-1">
            <div>{passwortFeedback.hasLower ? "✅" : "❌"} Kleinbuchstaben</div>
            <div>{passwortFeedback.hasUpper ? "✅" : "❌"} Großbuchstaben</div>
            <div>{passwortFeedback.hasNumber ? "✅" : "❌"} Zahl</div>
            <div>{passwortFeedback.hasSymbol ? "✅" : "❌"} Sonderzeichen</div>
            <div>
              {passwortFeedback.hasMinLength ? "✅" : "❌"} Mind. 8 Zeichen
            </div>
          </div>

          <div className="mt-2 h-2 w-full rounded bg-gray-300 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                passwortStarke <= 2
                  ? "bg-red-500 w-1/5"
                  : passwortStarke === 3
                  ? "bg-yellow-400 w-3/5"
                  : passwortStarke === 4
                  ? "bg-yellow-500 w-4/5"
                  : "bg-green-500 w-full"
              }`}
            />
          </div>
          <p className="text-xs mt-1">
            {passwortStarke <= 2
              ? "🔒 Sehr schwach"
              : passwortStarke === 3
              ? "🟡 Mittel"
              : passwortStarke === 4
              ? "🟠 Gut"
              : "🟢 Sehr stark"}
          </p>

          {/* Passwort bestätigen */}
          <div className="relative">
            <input
              type={passwortAnzeigen ? "text" : "password"}
              value={passwortBestaetigung}
              onChange={(e) => setPasswortBestaetigung(e.target.value)}
              placeholder="Passwort bestätigen"
              required
              className="w-full p-2 border rounded text-[var(--foreground)] pr-10"
            />
            {passwortBestaetigung && (
              <span className="absolute top-2 right-3">
                {passwort === passwortBestaetigung ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
              </span>
            )}
          </div>

          {/* Passwort anzeigen */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={passwortAnzeigen}
              onChange={() => setPasswortAnzeigen((prev) => !prev)}
            />
            Passwort anzeigen
          </label>

          <button
            type="submit"
            disabled={!istFormularGueltig}
            className={`w-full px-4 py-2 rounded text-white transition ${
              istFormularGueltig
                ? "bg-black hover:bg-gray-800 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            ➡️ Jetzt registrieren
          </button>

          {fehler && (
            <p className="text-red-500 text-sm text-center">{fehler}</p>
          )}
          {erfolg && (
            <p className="text-green-600 text-sm text-center">{erfolg}</p>
          )}
        </form>

        <p className="text-sm text-center mt-6">
          Bereits registriert?{" "}
          <a href="/login" className="underline hover:text-gray-500">
            Hier einloggen
          </a>
        </p>
      </div>
    </main>
  );
}
