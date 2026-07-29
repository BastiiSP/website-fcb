// Serverseitiger Zugriff auf den aktuellen Tenant.
//
// Die Proxy-Schicht (src/proxy.ts – in Next 16 der Nachfolger der Middleware)
// setzt den Header `x-tenant` auf jeder Anfrage; hier wird er gelesen. Bewusst
// getrennt von tenant.ts, weil `next/headers` nur in Server Components und
// Route Handlern importierbar ist – tenant.ts wird auch von Client Components
// und vom Proxy selbst genutzt.
//
// Achtung: `headers()` macht die aufrufende Route dynamisch. Das ist gewollt –
// ohne Request-Kontext lässt sich der Auftritt nicht bestimmen. Das Caching der
// externen Datenquellen (Behold, BFV) läuft weiter über `fetch`-revalidate und
// bleibt davon unberührt.

import { headers } from "next/headers";
import {
  DEFAULT_TENANT,
  TENANT_HEADER,
  getTenantConfig,
  istTenantId,
  tenantAusHostname,
  type TenantConfig,
  type TenantId,
} from "@/lib/tenant";

/** Aktueller Tenant der laufenden Anfrage. */
export async function getTenant(): Promise<TenantId> {
  const h = await headers();

  const vomHeader = h.get(TENANT_HEADER);
  if (istTenantId(vomHeader)) return vomHeader;

  // Fallback, falls der Proxy nicht gelaufen ist (z. B. bei statischen
  // Sonderfällen): direkt aus dem Host ableiten statt blind FCB anzunehmen.
  const host = h.get("host");
  if (host) return tenantAusHostname(host);

  return DEFAULT_TENANT;
}

/** Marken-Konfiguration der laufenden Anfrage. */
export async function getTenantConfigServer(): Promise<TenantConfig> {
  return getTenantConfig(await getTenant());
}
