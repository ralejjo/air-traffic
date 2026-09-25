import { aircraftQuerySchema, AircraftProviderError } from "@/features/airtraffic/aircraft";
import { getAircraft } from "@/features/airtraffic/aircraftService";

// Ruta dinámica sin desactivar la caché explícita de cinco segundos del proveedor.
export const revalidate = 0;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = aircraftQuerySchema.safeParse({ lat: params.get("lat"), lon: params.get("lon"), radiusNm: params.get("radiusNm") });
  if (!query.success) return Response.json({ error: { code: "INVALID_QUERY", message: "Indicá latitud (-90 a 90), longitud (-180 a 180) y radio (1 a 250 NM) válidos." } }, { status: 400, headers });
  try {
    return Response.json(await getAircraft(query.data), { headers });
  } catch (error) {
    const failure = error instanceof AircraftProviderError ? error : new AircraftProviderError("PROVIDER_UNAVAILABLE", 502, "El servicio de aeronaves no está disponible.");
    return Response.json({ error: { code: failure.code, message: failure.message, ...(failure.retryAfterSeconds ? { retryAfterSeconds: failure.retryAfterSeconds } : {}) } }, {
      status: failure.status,
      headers: { ...headers, ...(failure.retryAfterSeconds ? { "Retry-After": String(failure.retryAfterSeconds) } : {}) },
    });
  }
}
