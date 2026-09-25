// OpenNext adapta este Route Handler a Workers.
// Salud de la aplicación; la disponibilidad del proveedor se verifica en /api/aircraft.
export const runtime = "edge";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "air-traffic",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      checks: {
        application: "ok",
        database: "not_configured",
        aircraftProvider: "not_checked",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
