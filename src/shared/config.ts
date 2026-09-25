// Vacío para el despliegue standalone. Permite un futuro montaje bajo un Site.
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);
export function apiPath(path: string) {
  return `${basePath}/api/${path.replace(/^\//, "")}`;
}
