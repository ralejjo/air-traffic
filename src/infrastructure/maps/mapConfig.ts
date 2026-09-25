export type MapLocation = {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  zoom: number;
  code: string;
};
export const locations: readonly MapLocation[] = [
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    coordinates: [-58.3816, -34.6037],
    zoom: 8.4,
    code: "BUE",
  },
  {
    id: "londres",
    name: "Londres",
    country: "Reino Unido",
    coordinates: [-0.1276, 51.5072],
    zoom: 8.4,
    code: "LON",
  },
  {
    id: "nueva-york",
    name: "Nueva York",
    country: "Estados Unidos",
    coordinates: [-74.006, 40.7128],
    zoom: 8.4,
    code: "NYC",
  },
  {
    id: "tokio",
    name: "Tokio",
    country: "Japón",
    coordinates: [139.6917, 35.6895],
    zoom: 8.4,
    code: "TYO",
  },
];
export const defaultLocation = locations[0];
export const mapStyleUrl =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/dark";
export const mapLocale = {
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "NavigationControl.ResetBearing": "Orientar el mapa hacia el norte",
  "AttributionControl.ToggleAttribution": "Mostrar atribuciones del mapa",
  "AttributionControl.MapFeedback": "Informar un error en el mapa",
  "FullscreenControl.Enter": "Pantalla completa",
  "FullscreenControl.Exit": "Salir de pantalla completa",
  "Map.Title": "Mapa interactivo",
};
