// OpenNext adapta este Route Handler a Workers.
// SQLite se incorporará en la etapa 4; no se informa como conectado todavía.
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
        aircraftProvider: "not_connected",
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
