import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const destination = new URL("../public/maplibre/", import.meta.url);
await mkdir(destination, { recursive: true });
// El worker de MapLibre 6 importa el módulo compartido desde su misma carpeta.
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  await copyFile(join(dist, file), new URL(file, destination));
}
