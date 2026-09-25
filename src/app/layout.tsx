import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirTraffic — Explorador de tráfico aéreo",
  description:
    "Una nueva perspectiva del cielo. Explorá el mapa y descubrí el espacio aéreo con AirTraffic.",
};
export const viewport: Viewport = {
  themeColor: "#101717",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
