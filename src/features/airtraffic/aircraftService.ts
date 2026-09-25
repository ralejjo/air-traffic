import { fetchAdsbFi } from "../../infrastructure/aircraft/adsbFi.ts";
import type { AircraftArea, AircraftSnapshot } from "./aircraft.ts";

export async function getAircraft(area: AircraftArea): Promise<AircraftSnapshot> {
  const snapshot = await fetchAdsbFi(area);
  return { ...snapshot, area, source: "adsb.fi" };
}
