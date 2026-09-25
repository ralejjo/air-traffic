"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Compass,
  Crosshair,
  Globe2,
  MapPin,
  MoveUpRight,
  Plane,
  Radio,
  Scan,
  Server,
  Wind,
} from "lucide-react";
import { defaultLocation, locations } from "@/infrastructure/maps/mapConfig";
import { apiPath } from "@/shared/config";
import { texts } from "@/shared/texts";
import type { ViewportInfo } from "./AirTrafficMap";

const AirTrafficMap = dynamic(() => import("./AirTrafficMap"), {
  ssr: false,
  loading: () => (
    <div className="map-message" role="status">
      {texts.mapLoading}
    </div>
  ),
});
const coordinate = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function AirTrafficShell() {
  const [location, setLocation] = useState(defaultLocation);
  const [resetCount, setResetCount] = useState(0);
  const [viewport, setViewport] = useState<ViewportInfo>({
    longitude: defaultLocation.coordinates[0],
    latitude: defaultLocation.coordinates[1],
    zoom: defaultLocation.zoom,
  });
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async ({ signal }) => {
      const response = await fetch(apiPath("health"), {
        signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Servicio no disponible");
      const result = await response.json();
      if (result.status !== "ok") throw new Error("Servicio no disponible");
      return result;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="app-shell">
      <a className="skip-link" href="#explorar">
        Ir al mapa
      </a>
      <header className="topbar">
        <a className="brand" href="./" aria-label="AirTraffic, inicio">
          <span className="brand-symbol">
            <Plane size={24} strokeWidth={1.8} />
          </span>
          <span>
            airtraffic<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="topbar-divider" />
        <span className="brand-description">
          Una nueva perspectiva del cielo
        </span>
        <div className="topbar-right">
          <span className="edition">EXPLORADOR AÉREO</span>
          <span className="version-tag">V 0.1</span>
        </div>
      </header>
      <main id="explorar">
        <section className="overview" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">
              <span className="small-line" /> EL MUNDO, DESDE ARRIBA
            </p>
            <h1 id="page-title">
              Explorá el espacio aéreo<span>.</span>
            </h1>
            <p className="overview-description">
              Cada vuelo tiene una historia. Elegí dónde empezar.
            </p>
          </div>
          <div className="preview-status">
            <span className="status-dot" />
            {texts.preview}
            <span className="status-tag">VISTA PREVIA</span>
          </div>
        </section>
        <section className="explorer" aria-label="Explorador cartográfico">
          <div className="explorer-toolbar">
            <div className="toolbar-title">
              <Globe2 size={17} />
              <span>{texts.map}</span>
            </div>
            <div
              className="city-list"
              role="group"
              aria-label={texts.cityLabel}
            >
              {locations.map((city) => (
                <button
                  key={city.id}
                  aria-pressed={location.id === city.id}
                  onClick={() => {
                    setLocation(city);
                    setResetCount((count) => count + 1);
                  }}
                >
                  <span className="city-dot" />
                  {city.name}
                </button>
              ))}
            </div>
            <span className="toolbar-unit">COORD. WGS84</span>
          </div>
          <div className="explorer-body">
            <div
              className="map-region"
              role="region"
              aria-label="Mapa del espacio aéreo"
            >
              <AirTrafficMap
                location={location}
                resetCount={resetCount}
                onMove={setViewport}
              />
              <div className="location-card">
                <MapPin size={18} />
                <div>
                  <span className="eyebrow">UBICACIÓN DE REFERENCIA</span>
                  <h2>
                    {location.name}{" "}
                    <span>{location.country}</span>
                  </h2>
                </div>
                <span className="location-code">{location.code}</span>
              </div>
              <button
                className="recenter"
                title={texts.center}
                aria-label={texts.center}
                onClick={() => setResetCount((count) => count + 1)}
              >
                <Crosshair size={19} />
              </button>
              <div className="map-crosshair" aria-hidden="true">
                <span />
                <span />
              </div>
              <div className="map-note">
                <Radio size={14} />
                {texts.dataPending}
              </div>
            </div>
            <aside className="detail-panel" aria-labelledby="detail-title">
              <div className="panel-topline">
                <span className="eyebrow">TU PRÓXIMA PERSPECTIVA</span>
                <ArrowUpRight size={19} />
              </div>
              <div className="radar-art" aria-hidden="true">
                <div className="radar-ring ring-outer" />
                <div className="radar-ring ring-inner" />
                <div className="radar-axis axis-x" />
                <div className="radar-axis axis-y" />
                <div className="radar-sweep" />
                <Plane className="radar-plane" size={38} strokeWidth={1.2} />
                <span className="radar-n">N</span>
              </div>
              <h2 id="detail-title">
                Un mundo en
                <br />
                movimiento.
              </h2>
              <p className="panel-description">{texts.legend}</p>
              <div className="panel-divider" />
              <p className="eyebrow">ASÍ VAS A EXPLORAR</p>
              <ol className="explore-steps">
                <li>
                  <span className="step-icon">
                    <Compass size={18} />
                  </span>
                  <div>
                    <strong>Elegí tu perspectiva</strong>
                    <span>Mové el mapa o cambiá de ciudad.</span>
                  </div>
                </li>
                <li>
                  <span className="step-icon">
                    <Scan size={18} />
                  </span>
                  <div>
                    <strong>Encontrá un vuelo</strong>
                    <span>Próximamente: aeronaves en el mapa.</span>
                  </div>
                </li>
                <li>
                  <span className="step-icon">
                    <Wind size={18} />
                  </span>
                  <div>
                    <strong>Conocé su recorrido</strong>
                    <span>Próximamente: altitud y trayectoria.</span>
                  </div>
                </li>
              </ol>
              <div className="panel-footer">
                <span className="tiny-dot" />
                El cielo es el punto de partida.
                <MoveUpRight size={16} />
              </div>
            </aside>
          </div>
          <div className="coordinates-bar">
            <div>
              <Crosshair size={14} />
              <span>CENTRO DEL MAPA</span>
              <strong data-testid="coordinates">
                {coordinate.format(viewport.latitude)}° /{" "}
                {coordinate.format(viewport.longitude)}°
              </strong>
            </div>
            <span className="zoom-readout">
              ZOOM{" "}
              {new Intl.NumberFormat("es-AR", {
                maximumFractionDigits: 1,
              }).format(viewport.zoom)}
            </span>
          </div>
        </section>
        <section
          className="bottom-strip"
          aria-label="Información de la vista previa"
        >
          <div>
            <span className="outline-icon">
              <ArrowDownLeft size={18} />
            </span>
            <p>
              La exploración empieza acá.
              <span>Mapa global · Sin registro · A tu ritmo</span>
            </p>
          </div>
          <p className="release-note">
            Primera entrega<span>Mapa base y servicio de aplicación</span>
          </p>
        </section>
      </main>
      <footer className="footer">
        <span>
          © {new Date().getFullYear()} AirTraffic
          <span className="footer-separator">/</span>Hecho para mirar más lejos.
        </span>
        <span className="health-status" role="status">
          <Server size={13} />
          <span
            className={`tiny-dot ${health.isError ? "error-dot" : health.isSuccess ? "ok-dot" : ""}`}
          />
          {health.isPending
            ? texts.serviceLoading
            : health.isError
              ? texts.serviceError
              : texts.serviceOk}
        </span>
      </footer>
    </div>
  );
}
