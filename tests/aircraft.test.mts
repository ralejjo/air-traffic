import test from "node:test";
import assert from "node:assert/strict";
import { aircraftQuerySchema } from "../src/features/airtraffic/aircraft.ts";
import { fetchAdsbFi, normalizeAircraft, retryAfterSeconds } from "../src/infrastructure/aircraft/adsbFi.ts";

const area = { lat: 51.5072, lon: -0.1276, radiusNm: 100 };
const position = { hex: "ABC123", lat: 51, lon: 0, seen_pos: 0 };
test("consulta: coordenadas y radio obligatorios, finitos y acotados", () => {
  assert.deepEqual(aircraftQuerySchema.parse({ lat: "51.5072", lon: "-0.1276", radiusNm: "100" }), area);
  for (const bad of ["", " ", "NaN", "Infinity", "91"]) assert.equal(aircraftQuerySchema.safeParse({ lat: bad, lon: "0", radiusNm: "100" }).success, false);
  for (const radiusNm of ["0", "251", null]) assert.equal(aircraftQuerySchema.safeParse({ lat: "0", lon: "0", radiusNm }).success, false);
});
test("normaliza valores ausentes, identificación y estado en tierra", () => {
  const { aircraft } = normalizeAircraft({ ac: [{ ...position, flight: " TEST  ", alt_baro: "ground", gs: 0, track: 360 }] });
  assert.equal(aircraft[0].id, "abc123");
  assert.equal(aircraft[0].callsign, "TEST");
  assert.equal(aircraft[0].onGround, true);
  assert.equal(aircraft[0].altitudeFt, null);
  assert.equal(aircraft[0].registration, null);
  assert.equal(aircraft[0].speedKt, 0);
  assert.equal(aircraft[0].headingDeg, 0);
});
test("descarta posiciones inválidas, antiguas o sin antigüedad", () => {
  const { aircraft } = normalizeAircraft({ ac: [null, { ...position, lat: 91 }, { ...position, seen_pos: 61 }, { ...position, seen_pos: undefined }, { ...position, seen_pos: 60 }] });
  assert.equal(aircraft.length, 1);
  assert.equal(aircraft[0].positionAgeSeconds, 60);
});
test("distingue ausencia de vuelos de respuesta malformada", () => {
  assert.deepEqual(normalizeAircraft({ ac: [] }).aircraft, []);
  assert.throws(() => normalizeAircraft({ error: "failed" }), { code: "PROVIDER_INVALID_RESPONSE" });
});
test("conserva fecha de origen para no rejuvenecer la caché", () => {
  assert.equal(normalizeAircraft({ ac: [], now: 1700000000000 }).fetchedAt, "2023-11-14T22:13:20.000Z");
});
test("429 conserva Retry-After numérico o fecha y usa fallback", async () => {
  assert.equal(retryAfterSeconds("12"), 12);
  assert.equal(retryAfterSeconds(null), 30);
  assert.equal(retryAfterSeconds("Thu, 01 Jan 1970 00:01:00 GMT", 0), 60);
  await assert.rejects(fetchAdsbFi(area, async () => new Response(null, { status: 429, headers: { "Retry-After": "12" } })), { code: "RATE_LIMITED", status: 429, retryAfterSeconds: 12 });
});
test("timeout cancela solicitud y retorna error controlado", async () => {
  const fetcher: typeof fetch = async (_url, init) => new Promise((_resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("No se canceló")), 1000);
    init?.signal?.addEventListener("abort", () => { clearTimeout(timer); reject(init.signal?.reason); }, { once: true });
  });
  await assert.rejects(fetchAdsbFi(area, fetcher, 10), { code: "PROVIDER_TIMEOUT", status: 504 });
});
test("errores HTTP y JSON inválido no se convierten en lista vacía", async () => {
  await assert.rejects(fetchAdsbFi(area, async () => new Response(null, { status: 503 })), { code: "PROVIDER_UNAVAILABLE" });
  await assert.rejects(fetchAdsbFi(area, async () => new Response("not json")), { code: "PROVIDER_INVALID_RESPONSE" });
});
