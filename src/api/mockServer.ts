export async function sendTestRequest(cfg: {
  url: string;
  method: string;
  headers: { key: string; value: string }[];
  body?: string;
}) {
  // Simulated latency
  await new Promise((r) => setTimeout(r, 380));

  // Example echo, with naive JSON parsing
  let parsed: unknown = undefined;
  try {
    parsed = cfg.body ? JSON.parse(cfg.body) : undefined;
  } catch {
    parsed = { __raw: cfg.body };
  }

  return {
    status: 'success',
    statusCode: 200,
    request: {
      url: cfg.url,
      method: cfg.method,
      headers: cfg.headers,
      body: parsed,
    },
    body: {
      ok: true,
      echoed: parsed ?? null,
      example: { id: 'abc123', ts: Date.now() },
    },
    responseHeaders: { 'content-type': 'application/json', 'x-mock': 'true' },
    latencyMs: 380,
  };
}
