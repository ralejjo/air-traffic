# Proxy ADS-B

Proxy mínimo para consultar `adsb.fi` desde un runtime que no puede realizar la subrequest directamente. No forma parte de la app Next.js ni del build de Webflow.

## Despliegue

Desde la raíz del proyecto, con una sesión de Wrangler autenticada:

```sh
npx wrangler deploy --config proxy/wrangler.jsonc
```

Anotá la URL `workers.dev` o el dominio propio asignado.

## Configuración en AirTraffic

Definí `ADSB_PROXY_URL` en el environment de Webflow Cloud, apuntando a:

```text
https://<worker>.workers.dev/aircraft
```

El endpoint acepta:

```text
GET /aircraft?lat=51.5072&lon=-0.1276&dist=100
GET /health
```

El proxy reenvía la respuesta normalizada de `adsb.fi` y limita cada consulta a 5 segundos. El backend de AirTraffic conserva su fallback a OpenSky si el proxy no está disponible.

Opcionalmente se puede definir `ALLOWED_ORIGIN` en el Worker para restringir el acceso desde navegador. El servidor de AirTraffic no necesita CORS.
