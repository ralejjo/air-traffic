import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "4rem", textAlign: "center" }}>
      <h1>Página no encontrada</h1>
      <p>La dirección que buscás no existe.</p>
      <Link href="/">Volver al mapa</Link>
    </main>
  );
}
