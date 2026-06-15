import type { ComponentType } from "react";

export type AuthScreen = "login" | "register" | "confirm";

export interface AuthVariantProps {
  screen: AuthScreen;
  onNavigate: (screen: AuthScreen) => void;
}

export interface VariantMeta {
  slug: string;
  label: string;
  beschreibung: string;
  Component: ComponentType<AuthVariantProps>;
}
