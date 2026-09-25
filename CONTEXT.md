# Contexto de AirTraffic

Aplicación Next.js App Router / React / TypeScript para explorar tráfico aéreo, con UI completamente en español. La base procede del starter oficial de Webflow; ya no es una demo Hello World.

## Estado

Plan vigente: `docs/MVP-ENTREGA.md`, cuatro etapas con presupuesto objetivo de cinco horas. Endpoint de aeronaves implementado, pendiente de push del usuario y validación en Webflow. No implementar persistencia ni las ampliaciones del plan original. Commits y pushes siguen siendo exclusivamente del usuario.

Entrega local de la etapa 1: mapa base, cuatro ciudades, controles y `/api/health`. Sin vuelos ni persistencia todavía. Ver `README.md`, `docs/PLAN.md` y `docs/VALIDACION.md`.

## Decisiones

- El usuario crea el repositorio, hace commits y pushes. El agente no debe hacerlo.
- Detener esta entrega antes de publicar. Webflow MCP se usará después del push del usuario.
- OpenFreeMap, sin clave, reemplaza a MapTiler en esta entrega.
- Próximo backend: Route Handlers → AircraftService → adaptador ADSB.lol.
- SQLite con Drizzle para ubicaciones de visitantes anónimos en etapa 4.
- Sin KV, Object Storage, login ni backend separado en el MVP.
- No mostrar mocks como vuelos reales, ni describir datos ausentes como sistemas apagados.
- No forzar runtime edge de Next.js: el adaptador OpenNext ejecuta los handlers en Workers.

## Verificación

Usar `npm ci` y `npm run check`. Revisar el mapa en navegador, los cambios de ciudad y las respuestas de `/api/health`. Mantener las fuentes, atribuciones y textos de error en español.
