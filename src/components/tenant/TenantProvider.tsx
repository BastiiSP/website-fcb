"use client";

// Stellt die Marken-Konfiguration den Client Components zur Verfügung
// (Header, Vereins-Switcher, Formulare). Der Wert kommt einmalig aus dem
// Root-Layout (Server Component) und ändert sich innerhalb einer Domain nie –
// deshalb genügt ein einfacher Context ohne State.
//
// Muster analog zum bestehenden ConsentProvider.

import { createContext, useContext } from "react";
import { DEFAULT_TENANT, getTenantConfig, type TenantConfig } from "@/lib/tenant";

const TenantContext = createContext<TenantConfig>(getTenantConfig(DEFAULT_TENANT));

export function TenantProvider({
  config,
  children,
}: {
  config: TenantConfig;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>;
}

/**
 * Marken-Konfiguration des aktuellen Auftritts.
 * Fällt ohne Provider auf den FCB zurück (Bestandsverhalten), damit einzeln
 * gerenderte Komponenten – etwa in Tests – nicht crashen.
 */
export function useTenant(): TenantConfig {
  return useContext(TenantContext);
}
