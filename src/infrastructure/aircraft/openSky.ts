import { z } from "zod";
import { AircraftProviderError, type Aircraft, type AircraftArea } from "../../features/airtraffic/aircraft.ts";

const openSkySchema = z.object({
  time: z.number().finite(),
  states: z.array(z.array(z.unknown())).nullable(),
});
type WorkerRequestInit = RequestInit & { cf?: { scrapeShield?: boolean } };

const text = (value: unknown) => typeof value === "string" ? value.trim() || null : null;
const numeric = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
const feetPerMeter = 3.28084;
const knotsPerMeterPerSecond = 1.94384;
const nmPerKm = 0.539957;

function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians;
  const dLon = (lon2 - lon1) * radians;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a)) * nmPerKm;
}

export function normalizeOpenSky(payload: unknown, area: AircraftArea): { aircraft: Aircraft[]; fetchedAt: string } {
  const parsed = openSkySchema.safeParse(payload);
  if (!parsed.success) throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "El proveedor devolvió datos inválidos.");
  const fetchedAt = new Date(parsed.data.time * 1000);
  if (!Number.isFinite(fetchedAt.getTime())) throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "Fecha del proveedor inválida.");
  const aircraft = new Map<string, Aircraft>();
  for (const state of parsed.data.states ?? []) {
    if (state.length < 12) continue;
    const id = text(state[0])?.toLowerCase();
    const latitude = numeric(state[6]);
    const longitude = numeric(state[5]);
    const lastContact = numeric(state[4]) ?? numeric(state[3]);
    if (!id || latitude === null || latitude < -90 || latitude > 90 || longitude === null || longitude < -180 || longitude > 180 || lastContact === null) continue;
    const positionAgeSeconds = Math.max(0, parsed.data.time - lastContact);
    if (positionAgeSeconds > 60 || distanceNm(area.lat, area.lon, latitude, longitude) > area.radiusNm) continue;
    const altitudeMeters = numeric(state[7]);
    const velocity = numeric(state[9]);
    const track = numeric(state[10]);
    aircraft.set(id, {
      id,
      callsign: text(state[1]),
      registration: null,
      aircraftType: null,
      latitude,
      longitude,
      altitudeFt: altitudeMeters === null ? null : Math.round(altitudeMeters * feetPerMeter),
      speedKt: velocity === null ? null : Math.round(velocity * knotsPerMeterPerSecond * 10) / 10,
      headingDeg: track === null || track < 0 || track > 360 ? null : track % 360,
      onGround: state[8] === true,
      positionAgeSeconds,
    });
  }
  return { aircraft: [...aircraft.values()], fetchedAt: fetchedAt.toISOString() };
}

export async function fetchOpenSky(area: AircraftArea, fetcher: typeof fetch = fetch, timeoutMs = 5000) {
  const latDelta = Math.min(89, area.radiusNm / 60);
  const lonDelta = Math.min(180, area.radiusNm / (60 * Math.max(0.1, Math.cos(area.lat * Math.PI / 180))));
  const params = new URLSearchParams({
    lamin: String(Math.max(-90, area.lat - latDelta)),
    lomin: String(Math.max(-180, area.lon - lonDelta)),
    lamax: String(Math.min(90, area.lat + latDelta)),
    lomax: String(Math.min(180, area.lon + lonDelta)),
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const requestInit: WorkerRequestInit = {
      headers: { "User-Agent": "AirTraffic/0.1 (https://github.com/ralejjo/air-traffic)", Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    };
    const response = await fetcher(`https://opensky-network.org/api/states/all?${params}`, requestInit);
    if (response.status === 429) throw new AircraftProviderError("RATE_LIMITED", 429, "El proveedor limitó las consultas. Reintentá en unos segundos.");
    if (!response.ok) throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "No pudimos consultar el proveedor alternativo.");
    let payload: unknown;
    try { payload = await response.json(); }
    catch {
      if (controller.signal.aborted) throw new AircraftProviderError("PROVIDER_TIMEOUT", 504, "El proveedor tardó demasiado en responder.");
      throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "El proveedor devolvió una respuesta inválida.");
    }
    return normalizeOpenSky(payload, area);
  } catch (error) {
    if (controller.signal.aborted) throw new AircraftProviderError("PROVIDER_TIMEOUT", 504, "El proveedor tardó demasiado en responder.");
    if (error instanceof AircraftProviderError) throw error;
    throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "No pudimos conectar con el proveedor alternativo.");
  } finally {
    clearTimeout(timer);
  }
}
