import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { pcbSessionCookieName } from '../../../../lib/auth';

function getQgisRequestUrl(request: Request) {
  const serviceUrl = process.env.PCB_QGIS_SERVER_URL ?? '';
  const projectFile = process.env.PCB_QGIS_PROJECT_FILE ?? '';

  if (!serviceUrl || !projectFile) {
    return null;
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(serviceUrl);

  targetUrl.searchParams.set('MAP', projectFile);
  targetUrl.searchParams.set('SERVICE', 'WMS');
  targetUrl.searchParams.set('VERSION', '1.3.0');
  targetUrl.searchParams.set('REQUEST', 'GetFeatureInfo');
  targetUrl.searchParams.set(
    'LAYERS',
    requestUrl.searchParams.get('layers') ?? 'pcb_subject_parcel_links,pcb_parcels,pcb_subjects',
  );
  targetUrl.searchParams.set(
    'QUERY_LAYERS',
    requestUrl.searchParams.get('queryLayers') ??
      requestUrl.searchParams.get('layers') ??
      'pcb_subject_parcel_links,pcb_parcels,pcb_subjects',
  );
  targetUrl.searchParams.set('STYLES', requestUrl.searchParams.get('styles') ?? 'default,default,default');
  targetUrl.searchParams.set('CRS', requestUrl.searchParams.get('crs') ?? 'EPSG:4326');
  targetUrl.searchParams.set('BBOX', requestUrl.searchParams.get('bbox') ?? '');
  targetUrl.searchParams.set('WIDTH', requestUrl.searchParams.get('width') ?? '');
  targetUrl.searchParams.set('HEIGHT', requestUrl.searchParams.get('height') ?? '');
  targetUrl.searchParams.set('I', requestUrl.searchParams.get('i') ?? '');
  targetUrl.searchParams.set('J', requestUrl.searchParams.get('j') ?? '');
  targetUrl.searchParams.set('INFO_FORMAT', 'application/json');
  targetUrl.searchParams.set('FEATURE_COUNT', requestUrl.searchParams.get('featureCount') ?? '10');

  return targetUrl;
}

function resolveReturnTo(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedReturnTo = requestUrl.searchParams.get('returnTo');

  if (requestedReturnTo?.startsWith('/')) {
    return requestedReturnTo;
  }

  return '/gis';
}

function buildErrorResponse(input: {
  requestId: string;
  statusCode: number;
  errorCode: string;
  errorType: 'authentication' | 'authorization' | 'runtime' | 'domain';
  message: string;
  details?: Record<string, unknown>;
  loginPath?: string;
}) {
  const response = NextResponse.json(
    {
      statusCode: input.statusCode,
      error: {
        code: input.errorCode,
        type: input.errorType,
        message: input.message,
        ...(input.details ? { details: input.details } : {}),
        path: '/api/qgis/feature-info',
        timestamp: new Date().toISOString(),
        requestId: input.requestId,
      },
      ...(input.loginPath ? { loginPath: input.loginPath } : {}),
    },
    { status: input.statusCode },
  );

  response.headers.set('x-request-id', input.requestId);

  return response;
}

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? randomUUID();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(pcbSessionCookieName)?.value;
  const returnTo = resolveReturnTo(request);

  if (!accessToken) {
    return buildErrorResponse({
      requestId,
      statusCode: 401,
      errorCode: 'auth.frontend_session_missing',
      errorType: 'authentication',
      message: 'Missing frontend session.',
      loginPath: `/login?next=${encodeURIComponent(returnTo)}&reason=session`,
    });
  }

  const targetUrl = getQgisRequestUrl(request);

  if (!targetUrl) {
    return buildErrorResponse({
      requestId,
      statusCode: 503,
      errorCode: 'gis.publication_target_not_configured',
      errorType: 'runtime',
      message: 'QGIS publication target is not configured.',
    });
  }

  try {
    const response = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'x-request-id': requestId,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      return buildErrorResponse({
        requestId,
        statusCode: 502,
        errorCode: 'gis.feature_info_upstream_failed',
        errorType: 'runtime',
        message: `QGIS GetFeatureInfo failed with upstream status ${response.status}.`,
        details: {
          upstreamStatusCode: response.status,
        },
      });
    }

    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application/json',
      },
    });

    nextResponse.headers.set('x-request-id', requestId);

    return nextResponse;
  } catch {
    return buildErrorResponse({
      requestId,
      statusCode: 502,
      errorCode: 'gis.feature_info_unreachable',
      errorType: 'runtime',
      message: 'QGIS GetFeatureInfo is unreachable from the frontend proxy.',
    });
  }
}
