# MVP acelerado: estado y comprobaciones

Se reemplaza el plan original de siete etapas por cuatro: backend (60 min), recorrido principal (120 min), validación y entrega (90 min), reserva de estabilización (30 min). Son tiempos objetivo, no garantías.

## Primer punto de subida: backend

Implementado `GET /api/aircraft?lat=51.5072&lon=-0.1276&radiusNm=100`. Latitud, longitud y radio son obligatorios; rango del radio: 1–250 NM. El frontend utilizará 100 NM.

Respuesta exitosa: `aircraft`, `area`, `fetchedAt` y `source`. Cada aeronave contiene `id`, `callsign`, `registration`, `aircraftType`, `latitude`, `longitude`, `altitudeFt`, `speedKt`, `headingDeg`, `onGround` y `positionAgeSeconds`. Los valores opcionales ausentes son `null`. Las posiciones inválidas, sin antigüedad conocida o mayores a 60 segundos se descartan. Una lista vacía es un resultado válido.

Errores JSON: `error.code` y `error.message` en español. Consulta inválida: 400; límite del proveedor: 429 con `Retry-After`; proveedor inaccesible o respuesta inválida: 502; timeout de cinco segundos: 504. No se devuelven mensajes internos del proveedor.

La consulta externa pide caché de cinco segundos a Next/OpenNext; el endpoint responde `Cache-Control: no-store`. `fetchedAt` conserva el timestamp original del proveedor para no rejuvenecer una respuesta cacheada. La caché es una optimización: no se presupone almacenamiento compartido entre instancias ni se agregan bindings. Su comportamiento efectivo en Webflow queda pendiente de comprobar tras el push.

`/api/health` verifica la aplicación, no realiza una llamada al proveedor. `aircraftProvider: not_checked` significa que debe comprobarse `/api/aircraft` por separado.

## Comprobaciones y siguiente paso

- Pruebas con `npm test`: consulta, normalización, ausencia de datos, antigüedad, respuestas inválidas, límite de consultas y cancelación por timeout.
- `npm run check`: ESLint, TypeScript y compilación de producción.
- ADSB.lol respondió HTTP 200 con aeronaves reales de Londres desde el entorno local.
- Prueba del endpoint completo sobre build de producción local: HTTP 200 con 280 aeronaves de Londres; consulta inválida HTTP 400. Dos consultas consecutivas conservaron el timestamp del proveedor. Ocho pruebas automáticas, ESLint, TypeScript y build completados correctamente. El servidor temporal se detuvo después de comprobarlo.
- El endpoint de salud actualmente publicado respondió HTTP 200 antes de estos cambios.
- El backend nuevo todavía requiere commit y push manuales del usuario. Tras desplegar, verificar el endpoint de Londres y una consulta inválida en Webflow, y revisar logs antes de continuar la interfaz.

## Límites del MVP

No se incorporan SQLite, Drizzle, KV, Object Storage, favoritos, autenticación, trayectorias ni interpolación. Los datos proceden de [ADSB.lol](https://www.adsb.lol/); su cobertura y límites de consulta pueden variar. No se muestran vuelos ficticios.

El usuario realiza todos los commits y pushes. Desarrollo directamente en `D:\air-traffic`. No se crean repositorios adicionales ni ZIP.
