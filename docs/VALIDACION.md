# Validación de la entrega 1

Fecha: 25 de septiembre de 2026. Entorno local Windows, Node.js 24.19.0, Next.js 16.3.6. Verificación sobre el servidor de producción (`next build` y `next start`).

- ESLint, comprobación TypeScript y build de producción: correctos.
- Auditoría npm después de actualizar dependencias compatibles: cero vulnerabilidades reportadas al realizar la entrega.
- `/api/health`: HTTP 200, `Cache-Control: no-store`, aplicación disponible; base de datos sin configurar y proveedor aéreo sin conectar.
- Mapa OpenFreeMap visible; cambio entre Buenos Aires, Londres, Nueva York y Tokio y actualización de coordenadas comprobados en navegador.
- Botón de zoom: 8,4 → 9,4. Recentrado: regreso a 8,4.
- Diseño revisado en escritorio y a 390 × 844; sin desbordamiento horizontal.
- Controles y mensajes propios en español. Se conservan las atribuciones originales de los proveedores cartográficos.
- Worker de MapLibre servido desde archivos generados en el build; se corrigió y verificó la carga que fallaba con el empaquetado automático.

## Límites y pendientes

El estilo externo emitió una advertencia por el símbolo opcional `circle-11`; la cartografía, nombres y navegación funcionan. No se garantiza disponibilidad del proveedor externo.

No hay vuelos reales todavía: pertenecen a las etapas siguientes. No se ha desplegado ni comprobado el runtime de Webflow Cloud; esa parte de la etapa 1 queda pendiente de que el usuario suba su repositorio. Tampoco se ha probado exhaustivamente la compatibilidad entre navegadores ni realizado una auditoría completa de accesibilidad.

El ZIP contiene código, configuración, lockfile e instrucciones. Excluye historial Git, dependencias instaladas, builds, cachés y archivos de secretos. Los workers cartográficos se regeneran automáticamente mediante `npm run dev` o `npm run build`.
