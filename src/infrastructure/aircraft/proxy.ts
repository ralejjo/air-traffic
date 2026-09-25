import { AircraftProviderError, type AircraftArea } from "../../features/airtraffic/aircraft.ts";
import { normalizeAircraft } from "./adsbFi.ts";

export async function fetchAircraftProxy(baseUrl: string, area: AircraftArea, fetcher: typeof fetch = fetch, timeoutMs = 5000) {
  if (!Number.isFinite(area.lat) || !Number.isFinite(area.lon) || !Number.isFinite(area.radiusNm)) {
    throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "El proxy de aeronaves recibió un área inválida.");
  }
  let endpoint: URL;
  try {
    endpoint = new URL(baseUrl);
  } catch {
    throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "El proxy de aeronaves está configurado incorrectamente.");
  }
  endpoint.search = new URLSearchParams({
    lat: String(area.lat),
    lon: String(area.lon),
    dist: String(area.radiusNm),
  }).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(endpoint, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status === 429) throw new AircraftProviderError("RATE_LIMITED", 429, "El proxy limitó las consultas. Reintentá en unos segundos.");
    if (!response.ok) throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "El proxy de aeronaves no está disponible.");
    let payload: unknown;
    try { payload = await response.json(); }
    catch {
      if (controller.signal.aborted) throw new AircraftProviderError("PROVIDER_TIMEOUT", 504, "El proxy tardó demasiado en responder.");
      throw new AircraftProviderError("PROVIDER_INVALID_RESPONSE", 502, "El proxy devolvió una respuesta inválida.");
    }
    return normalizeAircraft(payload);
  } catch (error) {
    if (controller.signal.aborted) throw new AircraftProviderError("PROVIDER_TIMEOUT", 504, "El proxy tardó demasiado en responder.");
    if (error instanceof AircraftProviderError) throw error;
    throw new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "No pudimos conectar con el proxy de aeronaves.");
  } finally {
    clearTimeout(timer);
  }
}
