import { z } from "zod";

const numberParam = (min: number, max: number) => z.string().trim().min(1)
  .transform(Number).pipe(z.number().finite().min(min).max(max));
export const aircraftQuerySchema = z.object({
  lat: numberParam(-90, 90),
  lon: numberParam(-180, 180),
  radiusNm: numberParam(1, 250),
});
export type AircraftArea = z.output<typeof aircraftQuerySchema>;
export type Aircraft = {
  id: string;
  callsign: string | null;
  registration: string | null;
  aircraftType: string | null;
  latitude: number;
  longitude: number;
  altitudeFt: number | null;
  speedKt: number | null;
  headingDeg: number | null;
  onGround: boolean;
  positionAgeSeconds: number;
};
export type AircraftSnapshot = {
  aircraft: Aircraft[];
  area: AircraftArea;
  fetchedAt: string;
  source: "ADSB.lol";
};

export class AircraftProviderError extends Error {
  constructor(
    public readonly code: "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "PROVIDER_INVALID_RESPONSE" | "RATE_LIMITED",
    public readonly status: number,
    message: string,
    public readonly retryAfterSeconds?: number,
  ) { super(message); }
}
