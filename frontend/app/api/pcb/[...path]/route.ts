import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  pcbSessionCookieName,
} from '../../../../lib/auth';
import { buildLoginRedirectPath } from '../../../../lib/auth-redirect';

const backendBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

async function proxyRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
  method: 'GET' | 'POST',
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(pcbSessionCookieName)?.value;

  if (!accessToken) {
    return buildProxyAuthResponse(
      request,
      'authentication_required',
      'Sessione frontend assente. Effettua di nuovo il login.',
      401,
      true,
    );
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

  if (response.status === 401) {
    return buildProxyAuthResponse(
      request,
      'authentication_required',
      'La sessione operatore non e` piu` valida. Effettua di nuovo il login.',
      401,
      true,
    );
  }

  if (response.status === 403) {
    return buildProxyAuthResponse(
      request,
      'unauthorized',
      'La sessione corrente non ha i permessi richiesti per questa operazione.',
      403,
      false,
    );
  }

  const responseText = await response.text();

  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

function buildProxyAuthResponse(
  request: Request,
  reason: 'authentication_required' | 'unauthorized',
  message: string,
  status: 401 | 403,
  clearSession: boolean,
) {
  const requestUrl = new URL(request.url);
  const referer = request.headers.get('referer');

  let nextPath: string | undefined;

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      nextPath = `${refererUrl.pathname}${refererUrl.search}${refererUrl.hash}`;
    } catch {
      nextPath = undefined;
    }
  }

  const response = NextResponse.json(
    {
      loginPath: buildLoginRedirectPath(
        reason,
        nextPath ?? `${requestUrl.pathname}${requestUrl.search}`,
      ),
      statusCode: status,
      error: {
        code: reason,
        type: status === 401 ? 'UnauthorizedException' : 'ForbiddenException',
        message,
        details: null,
        path: nextPath ?? `${requestUrl.pathname}${requestUrl.search}`,
        timestamp: new Date().toISOString(),
        requestId: randomUUID(),
      },
    },
    { status },
  );

  if (clearSession) {
    response.cookies.set(pcbSessionCookieName, '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
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
