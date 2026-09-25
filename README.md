# AirTraffic — Explorador de tráfico aéreo

Primera entrega del proyecto: base de Next.js, mapa interactivo y servicio de salud. Interfaz oscura en español, preparada para publicar como aplicación independiente en Webflow Cloud.

## Qué funciona en esta entrega

- Mapa global con MapLibre y OpenFreeMap; no requiere API key ni cuenta de mapas.
- Vistas de Buenos Aires, Londres, Nueva York y Tokio.
- Navegación, zoom, orientación al norte y regreso al centro de la ciudad.
- Coordenadas del centro y zoom actualizados al mover el mapa.
- Interfaz responsive, controles accesibles y movimiento reducido.
- Estados de carga, error de cartografía y reintento.
- `GET /api/health`, consultado por el indicador de servicio de la interfaz.

Las aeronaves reales se conectan en la etapa 2. El mapa no incluye vuelos ficticios. SQLite y las ubicaciones guardadas se incorporan en la etapa 4. Un servidor disponible no implica que ADSB.lol ni SQLite estén conectados.

## Requisitos y ejecución local

Node.js 22.12 o superior con npm. Se recomienda Node.js 24 LTS. Usar **npm** para mantener compatibilidad con Webflow Cloud.

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000. No hay variables obligatorias. `.env.example` documenta las opciones del mapa y el prefijo de rutas; copiarlo a `.env.local` solo si necesitás cambiarlas.

```sh
npm run check
```

Ese comando ejecuta ESLint, comprobación de tipos y build de producción. Para probar el resultado:

```sh
npm run start
```

### Verificar el backend

Abrir http://localhost:3000/api/health. Debe responder HTTP 200 con `status: "ok"`, un timestamp actual y:

```json
{
  "application": "ok",
  "database": "not_configured",
  "aircraftProvider": "not_connected"
}
```

La respuesta no se cachea y no contiene secretos. El indicador de la interfaz consulta el servicio cada minuto, pausando consultas periódicas cuando la pestaña está oculta.

## Subir esta entrega a tu repositorio

1. Creá el repositorio en GitHub y clonalo en la carpeta que elijas.
2. Extraé el ZIP y copiá **el contenido de `air-traffic/`** en la raíz del repositorio clonado. `package.json` debe quedar en esa raíz, sin una carpeta extra intermedia.
3. Conservá la carpeta `.git` de tu propio clon. Este ZIP no contiene historial Git.
4. Incluí el código, `.gitignore`, `.npmrc`, `.env.example`, `package.json`, `package-lock.json` y archivos de configuración/documentación.
5. No subas `node_modules`, `.next`, `.env.local` ni credenciales. `.gitignore` ya los excluye.
6. Hacé el commit y push manualmente. Después compartí la URL del repositorio para continuar con el despliegue.

**Esta entrega se detiene antes de crear, conectar o desplegar el repositorio.**

## Despliegue posterior en Webflow Cloud

- Aplicación independiente, montada en `/`, rama `main` y directorio raíz del repositorio.
- Framework declarado en `webflow.json`: `nextjs`.
- Build: `npm run build`. El lockfile permite instalación reproducible.
- No configurar salida estática: `/api/health` requiere ejecución de servidor.
- Webflow administra la adaptación a Workers con OpenNext. No fijamos `basePath`, `assetPrefix` ni configuración de infraestructura generada por la plataforma.
- No hay bindings de almacenamiento en esta etapa. Se agregarán con sus migraciones cuando implementemos SQLite.
- Operación de Webflow mediante MCP; valores de variables mediante CLI. Ningún token de Webflow debe incorporarse al proyecto.

La compatibilidad local no sustituye la comprobación del primer deployment en Workers: queda pendiente hasta que exista el repositorio y se reanude esa parte de la etapa 1.

## Estructura

```text
src/
  app/                    Página, layout, estilos y API de salud
  features/airtraffic/     Shell y mapa cliente
  infrastructure/maps/    Ciudades y configuración del proveedor de mapas
  shared/                 Textos, rutas y proveedor de TanStack Query
docs/
  PLAN.md                 Decisiones y próximas etapas
  VALIDACION.md           Evidencia de comprobaciones de esta entrega
```

El mapa se importa de forma diferida, solo en el navegador. El backend no utiliza filesystem, procesos ni sockets de Node. La UI usa las unidades y coordenadas habituales, con formatos numéricos en español de Argentina.

Los comandos `dev` y `build` ejecutan automáticamente `scripts/prepare-map.mjs`: copia el worker y su módulo compartido desde la versión instalada de MapLibre a `public/maplibre/`. Estos archivos generados no se versionan. Así se evita que el empaquetado de Next.js rompa la URL del worker.

## Cartografía y atribución

[OpenFreeMap](https://openfreemap.org/) provee la cartografía, con esquema de [OpenMapTiles](https://openmaptiles.org/) y datos de [OpenStreetMap](https://www.openstreetmap.org/copyright). MapLibre conserva sus atribuciones en el mapa. Los nombres usan español cuando está disponible y, en su defecto, el nombre local.

Se requiere conexión a Internet para los estilos, las teselas y las fuentes cartográficas de OpenFreeMap. Un fallo del proveedor muestra un aviso y permite reintentar; no se sustituye silenciosamente por datos inventados.

Base: [starter oficial de Webflow para Next.js](https://github.com/Webflow-Examples/hello-world-next-app). Configuración: [Bring your own app](https://developers.webflow.com/webflow-cloud/bring-your-own-app).
