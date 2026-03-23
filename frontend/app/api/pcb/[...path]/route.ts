import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { pcbSessionCookieName } from '../../../../lib/auth';

const backendBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

async function proxyRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
  method: 'GET' | 'POST',
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(pcbSessionCookieName)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Missing frontend session.' }, { status: 401 });
  }

  const { path } = await context.params;
  const targetUrl = new URL(`${backendBaseUrl}/${path.join('/')}`);
  const requestUrl = new URL(request.url);

  requestUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const response = await fetch(targetUrl, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
    },
    body: method === 'POST' ? await request.text() : undefined,
    cache: 'no-store',
  });

  const responseText = await response.text();

  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context, 'GET');
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context, 'POST');
}
