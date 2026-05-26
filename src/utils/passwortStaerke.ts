// Wiederverwendbare Passwort-Stärke-Logik (extrahiert aus /registrieren und für /profil genutzt)

export interface PasswortFeedback {
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasMinLength: boolean;
}

export function berechnePasswortFeedback(passwort: string): PasswortFeedback {
  return {
    hasLower: /[a-z]/.test(passwort),
    hasUpper: /[A-Z]/.test(passwort),
    hasNumber: /[0-9]/.test(passwort),
    hasSymbol: /[^A-Za-z0-9]/.test(passwort),
    hasMinLength: passwort.length >= 8,
  };
}

export function berechnePasswortStaerke(feedback: PasswortFeedback): number {
  return (
    Number(feedback.hasLower) +
    Number(feedback.hasUpper) +
    Number(feedback.hasNumber) +
    Number(feedback.hasSymbol) +
    Number(feedback.hasMinLength)
  );
}

export function passwortStaerkeLabel(score: number): string {
  if (score <= 2) return "Sehr schwach";
  if (score === 3) return "Mittel";
  if (score === 4) return "Gut";
  return "Sehr stark";
}

export function passwortStaerkefarbe(score: number): string {
  if (score <= 2) return "bg-red-500 w-1/5";
  if (score === 3) return "bg-yellow-400 w-3/5";
  if (score === 4) return "bg-yellow-500 w-4/5";
  return "bg-green-500 w-full";
}
