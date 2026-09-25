import { fetchAdsbLol } from "../../infrastructure/aircraft/adsbLol.ts";
import type { AircraftArea, AircraftSnapshot } from "./aircraft.ts";

export async function getAircraft(area: AircraftArea): Promise<AircraftSnapshot> {
  const snapshot = await fetchAdsbLol(area);
  return { ...snapshot, area, source: "ADSB.lol" };
}
