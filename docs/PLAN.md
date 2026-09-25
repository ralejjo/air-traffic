# Plan de implementación

MVP de aproximadamente 20 horas de trabajo efectivo. Interfaz en español. Repositorio, commits y pushes a cargo del usuario.

| Etapa | Entrega                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| 1     | Starter Next.js, mapa base y endpoint de salud. ZIP para subida manual. Primer deployment pendiente del push del usuario. |
| 2     | Adaptador adsb.fi, normalización, validación, timeout y manejo de errores.                                                |
| 3     | Aeronaves GeoJSON, selección, telemetría, métricas y filtros.                                                             |
| 4     | Ubicaciones guardadas por visitante anónimo en SQLite + Drizzle.                                                          |
| 5     | Interpolación, trayectorias de sesión y refinamiento responsive.                                                          |
| 6     | Pruebas funcionales, resiliencia y revisión en Workers.                                                                   |
| 7     | Verificación de producción, documentación final y recuperación de despliegues.                                            |

## Arquitectura acordada

Navegador (React, TanStack Query, MapLibre) → Next.js Route Handlers → servicio de aeronaves → adaptador adsb.fi. ADSB.lol fue reemplazado por un bloqueo HTTP 429 desde Webflow. La cartografía usa OpenFreeMap, sin claves.

`GET /api/aircraft?lat=...&lon=...&radiusNm=...`: coordenadas válidas, radio 1–250 NM, timeout de 5 segundos, contrato normalizado e información opcional nullable. Descartar posiciones inválidas o con más de 60 segundos. Polling de 10 segundos visible, debounce de 800 ms al mover y cancelación de solicitudes obsoletas. Mantener el último snapshot de la misma zona con antigüedad visible ante fallos.

La telemetría incluirá posición, ICAO, callsign, matrícula, tipo, altitud, velocidad sobre el suelo, dirección de desplazamiento, velocidad vertical, squawk y modos disponibles. Ascenso >300 ft/min, descenso <-300, nivelado entre ambos; estados en tierra y desconocido diferenciados.

Métricas sobre aeronaves visibles y filtradas, excluyendo valores desconocidos. Capas WebGL, interpolación entre datos recibidos sin extrapolación y trayectorias de hasta cinco minutos durante la sesión.

`GET/POST /api/locations` y `DELETE /api/locations/:id`: hasta diez ubicaciones por visitante identificado por cookie segura y aleatoria. Propietario derivado en servidor, aislamiento de visitantes y persistencia tras recarga. Sin cuentas ni sincronización entre dispositivos.

Publicación independiente en Webflow Cloud, rama `main`, montaje `/`. MCP para operar apps, entornos, deployments y logs; CLI para escribir variables. El usuario controla GitHub. No crear ni publicar nada hasta que el usuario comparta su repositorio y pida continuar.

## Fuera de alcance

Históricos, watchlists, autenticación, rutas comerciales, alertas, KV, Object Storage, WebSockets y datos de muestra presentados como tráfico real.
