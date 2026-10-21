import type { APIRoute } from 'astro';

const BACKEND_URL = import.meta.env.BACKEND_URL
  ?? process.env.BACKEND_URL
  ?? 'http://localhost:6543';

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path ?? '';
  const search = new URL(request.url).search;
  const target = `${BACKEND_URL}/api/${path}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
  };

  const adminToken = request.headers.get('X-Admin-Token');
  const authHeader = request.headers.get('Authorization');
  if (adminToken) headers['X-Admin-Token'] = adminToken;
  if (authHeader) headers['Authorization'] = authHeader;

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD'
      ? request.body
      : undefined,
    // Required for streaming request bodies
    // @ts-ignore
    duplex: 'half',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
};
