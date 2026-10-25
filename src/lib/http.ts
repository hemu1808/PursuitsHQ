export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expected = new URL(request.url);
    const incoming = new URL(origin);
    const host = (request.headers.get("host") || expected.host).toLowerCase();
    return incoming.host.toLowerCase() === host && incoming.protocol === expected.protocol;
  } catch { return false; }
}
