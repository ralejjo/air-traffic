"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapInstance } from "maplibre-gl";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import {
  defaultLocation,
  mapLocale,
  mapStyleUrl,
  type MapLocation,
} from "@/infrastructure/maps/mapConfig";
import { texts } from "@/shared/texts";
import { basePath } from "@/shared/config";

export type ViewportInfo = {
  longitude: number;
  latitude: number;
  zoom: number;
};
type Props = {
  location: MapLocation;
  resetCount: number;
  onMove: (viewport: ViewportInfo) => void;
};

export default function AirTrafficMap({ location, resetCount, onMove }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const callback = useRef(onMove);
  const [state, setState] = useState<
    "loading" | "ready" | "error" | "unsupported"
  >("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    callback.current = onMove;
  }, [onMove]);

  useEffect(() => {
    if (!container.current) return;
    let instance: MapInstance;
    try {
      maplibregl.setWorkerUrl(`${basePath}/maplibre/maplibre-gl-worker.mjs`);
      instance = new maplibregl.Map({
        container: container.current,
        style: mapStyleUrl,
        center: defaultLocation.coordinates,
        zoom: defaultLocation.zoom,
        minZoom: 2,
        maxZoom: 16,
        attributionControl: { compact: true },
        locale: mapLocale,
        renderWorldCopies: false,
      });
    } catch {
      queueMicrotask(() => setState("unsupported"));
      return;
    }
    map.current = instance;
    instance.getCanvas().setAttribute("aria-label", texts.mapCanvas);
    instance.addControl(
      new maplibregl.NavigationControl({ visualizePitch: false }),
      "bottom-right",
    );
    instance.addControl(
      new maplibregl.ScaleControl({ unit: "nautical" }),
      "bottom-left",
    );
    const reportView = () => {
      const center = instance.getCenter();
      callback.current({
        longitude: center.lng,
        latitude: center.lat,
        zoom: instance.getZoom(),
      });
    };
    const timer = window.setTimeout(() => setState("error"), 20_000);
    instance.on("load", () => {
      window.clearTimeout(timer);
      // Usar español cuando OpenMapTiles dispone de ese nombre.
      for (const layer of instance.getStyle().layers) {
        if (
          layer.type === "symbol" &&
          layer.layout?.["text-field"] &&
          /name/.test(JSON.stringify(layer.layout["text-field"]))
        ) {
          instance.setLayoutProperty(layer.id, "text-field", [
            "coalesce",
            ["get", "name:es"],
            ["get", "name:latin"],
            ["get", "name"],
          ]);
        }
      }
      setState("ready");
      reportView();
    });
    instance.on("error", () => {
      setState("error");
    });
    instance.on("moveend", reportView);
    const resize = new ResizeObserver(() => instance.resize());
    resize.observe(container.current);
    return () => {
      window.clearTimeout(timer);
      resize.disconnect();
      instance.remove();
      map.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    map.current?.flyTo({
      center: location.coordinates,
      zoom: location.zoom,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 1400,
      essential: false,
    });
  }, [location, resetCount, attempt]);

  function retry() {
    setState("loading");
    setAttempt((value) => value + 1);
  }

  return (
    <>
      <div className="map-canvas" ref={container} data-testid="map-canvas" />
      {state === "loading" && (
        <div className="map-message" role="status">
          <LoaderCircle className="spin" size={18} />
          {texts.mapLoading}
        </div>
      )}
      {(state === "error" || state === "unsupported") && (
        <div className="map-message map-message-error" role="alert">
          <TriangleAlert size={20} />
          <p>{state === "unsupported" ? texts.webglError : texts.mapError}</p>
          <button onClick={retry}>{texts.retry}</button>
        </div>
      )}
    </>
  );
}
