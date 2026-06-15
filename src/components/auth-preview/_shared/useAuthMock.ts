"use client";

import { useMemo, useState } from "react";
import {
  berechnePasswortFeedback,
  berechnePasswortStaerke,
  type PasswortFeedback,
} from "@/utils/passwortStaerke";

interface UseAuthMockOptions {
  /** Wird beim erfolgreichen (Mock-)Registrieren aufgerufen – Variante navigiert zu "confirm". */
  onRegistered: () => void;
}

/**
 * Front-End-Mock der Auth-Formulare für die Design-Preview.
 * KEIN echter Supabase-Call: Login zeigt einen Demo-Hinweis, Registrieren
 * wechselt bei gültigem Formular zum Confirm-Screen. Echte Logik kommt in der
 * späteren Apply-Runde.
 */
export function useAuthMock({ onRegistered }: UseAuthMockOptions) {
  // --- Login ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginInfo, setLoginInfo] = useState("");

  // --- Register ---
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [passwortBestaetigung, setPasswortBestaetigung] = useState("");
  const [registerFehler, setRegisterFehler] = useState("");

  // --- Shared ---
  const [googleInfo, setGoogleInfo] = useState("");

  const feedback: PasswortFeedback = useMemo(
    () => berechnePasswortFeedback(passwort),
    [passwort],
  );
  const staerke = useMemo(() => berechnePasswortStaerke(feedback), [feedback]);
  const passwoerterGleich = passwort.length > 0 && passwort === passwortBestaetigung;

  const registerGueltig =
    Boolean(vorname && nachname && email) &&
    passwort.length >= 8 &&
    passwoerterGleich;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: in der Preview gibt es keinen echten Login.
    setLoginInfo("Demo-Vorschau – der Login ist hier noch nicht aktiv.");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterFehler("");
    if (!vorname || !nachname) {
      setRegisterFehler("Bitte Vor- und Nachname ausfüllen.");
      return;
    }
    if (!passwoerterGleich) {
      setRegisterFehler("Die Passwörter stimmen nicht überein.");
      return;
    }
    // Mock-Erfolg → Variante zeigt Confirm-Screen.
    onRegistered();
  };

  const handleGoogle = () => {
    // UI-only in dieser Runde – echtes OAuth-Wiring folgt.
    setGoogleInfo("Google-Anmeldung wird in Kürze aktiviert.");
  };

  return {
    login: {
      email: loginEmail,
      setEmail: setLoginEmail,
      password: loginPassword,
      setPassword: setLoginPassword,
      info: loginInfo,
      handleSubmit: handleLogin,
    },
    register: {
      vorname,
      setVorname,
      nachname,
      setNachname,
      telefonnummer,
      setTelefonnummer,
      email,
      setEmail,
      passwort,
      setPasswort,
      passwortBestaetigung,
      setPasswortBestaetigung,
      feedback,
      staerke,
      passwoerterGleich,
      gueltig: registerGueltig,
      fehler: registerFehler,
      handleSubmit: handleRegister,
    },
    google: {
      info: googleInfo,
      handleClick: handleGoogle,
    },
  };
}
