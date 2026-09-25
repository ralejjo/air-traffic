import { z } from "zod";
import { AircraftProviderError, type Aircraft, type AircraftArea } from "../../features/airtraffic/aircraft.ts";

const envelopeSchema = z.object({ ac: z.array(z.unknown()), now: z.number().finite().optional() });
const text = (value: unknown) => typeof value === "string" ? value.trim() || null : null;
const numeric = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function normalizeAircraft(payload: unknown): { aircraft: Aircraft[]; fetchedAt: string } {
  const parsed = envelopeSchema.safeParse(payload);
  if (!parsed.success) throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "El proveedor devolvió datos inválidos.");
  const aircraft = new Map<string, Aircraft>();
  for (const item of parsed.data.ac) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const idValue = text(row.hex);
    const latitude = numeric(row.lat);
    const longitude = numeric(row.lon);
    const positionAgeSeconds = numeric(row.seen_pos);
    if (
      !idValue || latitude === null || latitude < -90 || latitude > 90 ||
      longitude === null || longitude < -180 || longitude > 180 ||
      positionAgeSeconds === null || positionAgeSeconds < 0 || positionAgeSeconds > 60
    ) continue;
    const speed = numeric(row.gs);
    const heading = numeric(row.track);
    const id = idValue.toLowerCase();
    aircraft.set(id, {
      id, callsign: text(row.flight), registration: text(row.r), aircraftType: text(row.t),
      latitude, longitude,
      altitudeFt: row.alt_baro === "ground" ? null : numeric(row.alt_baro),
      speedKt: speed !== null && speed >= 0 ? speed : null,
      headingDeg: heading !== null && heading >= 0 && heading <= 360 ? heading % 360 : null,
      onGround: row.alt_baro === "ground", positionAgeSeconds,
    });
  }
  // El timestamp del proveedor sobrevive a la caché: no rejuvenecer datos cacheados.
  const now = parsed.data.now;
  const date = now === undefined ? new Date() : new Date(now < 1e12 ? now * 1000 : now);
  if (!Number.isFinite(date.getTime())) throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "Fecha del proveedor inválida.");
  return { aircraft: [...aircraft.values()], fetchedAt: date.toISOString() };
}

export function retryAfterSeconds(value: string | null, now = Date.now()): number {
  if (!value?.trim()) return 30;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.max(1, Math.ceil(seconds));
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(1, Math.ceil((date - now) / 1000)) : 30;
}

export async function fetchAdsbFi(area: AircraftArea, fetcher: typeof fetch = fetch, timeoutMs = 5000) {
  // Usar AbortController + timer en vez de AbortSignal.timeout para que el
  // adaptador también funcione en runtimes Workers que no implementen el atajo.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(`https://opendata.adsb.fi/api/v3/lat/${area.lat}/lon/${area.lon}/dist/${area.radiusNm}`, {
      headers: { "User-Agent": "AirTraffic/0.1 (https://github.com/ralejjo/air-traffic)", Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status === 429) throw new AircraftProviderError("RATE_LIMITED", 429, "El proveedor limitó las consultas. Reintentá en unos segundos.", retryAfterSeconds(response.headers.get("retry-after")));
    if (!response.ok) throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "No pudimos consultar las aeronaves.");
    let payload: unknown;
    try { payload = await response.json(); }
    catch {
      if (controller.signal.aborted) throw new AircraftProviderError("PROVIDER_TIMEOUT", 504, "El proveedor tardó demasiado en responder.");
      throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "El proveedor devolvió una respuesta inválida.");
    }
    return normalizeAircraft(payload);
  } catch (error) {
    if (controller.signal.aborted) throw new AircraftProviderError("PROVIDER_TIMEOUT", 504, "El proveedor tardó demasiado en responder.");
    if (error instanceof AircraftProviderError) throw error;
    throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "No pudimos conectar con el proveedor de aeronaves.");
  } finally {
    clearTimeout(timer);
  }
}
