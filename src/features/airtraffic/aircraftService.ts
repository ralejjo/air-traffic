import { AircraftProviderError, type AircraftArea, type AircraftSnapshot } from "./aircraft.ts";
import { fetchAdsbFi } from "../../infrastructure/aircraft/adsbFi.ts";
import { fetchOpenSky } from "../../infrastructure/aircraft/openSky.ts";

export async function getAircraft(area: AircraftArea): Promise<AircraftSnapshot> {
  try {
    const snapshot = await fetchAdsbFi(area);
    return { ...snapshot, area, source: "adsb.fi" };
  } catch (error) {
    if (!(error instanceof AircraftProviderError)) throw error;
    try {
      const snapshot = await fetchOpenSky(area);
      return { ...snapshot, area, source: "opensky.network" };
    } catch {
      throw error;
    }
  }
}
