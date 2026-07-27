import { corsHeaders } from './cors.ts';

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function optionsResponse() {
  return new Response('ok', {
    headers: corsHeaders,
  });
}

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getRequestBodyKeys(body: unknown) {
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return Object.keys(body as Record<string, unknown>);
  }

  return [];
}
