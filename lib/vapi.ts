const VAPI_BASE_URL = "https://api.vapi.ai";

function getHeaders() {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error("VAPI_API_KEY is not configured");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export async function vapiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${VAPI_BASE_URL}${path}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vapi API error ${res.status}: ${body}`);
  }

  return res.json();
}

export async function vapiPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${VAPI_BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const responseBody = await res.text();
    throw new Error(`Vapi API error ${res.status}: ${responseBody}`);
  }

  return res.json();
}
