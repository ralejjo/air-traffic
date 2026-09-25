const upstream = (url) => `https://opendata.adsb.fi/api/v3/lat/${url.searchParams.get("lat")}/lon/${url.searchParams.get("lon")}/dist/${url.searchParams.get("dist")}`;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function validNumber(value, min, max) {
  return value !== null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN ?? "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }});
    }
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
    if (url.pathname === "/health") return json({ status: "ok", service: "air-traffic-adsb-proxy" });
    if (url.pathname !== "/aircraft" && url.pathname !== "/") return json({ error: "not_found" }, 404);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const dist = url.searchParams.get("dist");
    if (!validNumber(lat, -90, 90) || !validNumber(lon, -180, 180) || !validNumber(dist, 1, 250)) {
      return json({ error: "invalid_query" }, 400);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(upstream(url), {
        headers: { Accept: "application/json", "User-Agent": "AirTraffic-Proxy/0.1 (https://github.com/ralejjo/air-traffic)" },
        signal: controller.signal,
        cache: "no-store",
      });
      const body = await response.text();
      const headers = {
        "Content-Type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=5",
        "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN ?? "*",
        "X-Content-Type-Options": "nosniff",
      };
      const retryAfter = response.headers.get("retry-after");
      if (retryAfter) headers["Retry-After"] = retryAfter;
      return new Response(body, { status: response.status, headers });
    } catch {
      const timedOut = controller.signal.aborted;
      return json({ error: timedOut ? "upstream_timeout" : "upstream_unavailable" }, timedOut ? 504 : 502);
    } finally {
      clearTimeout(timer);
    }
  },
};

export default worker;
