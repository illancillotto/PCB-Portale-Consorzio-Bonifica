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
  targetUrl.searchParams.set('LAYERS', requestUrl.searchParams.get('layers') ?? 'pcb_parcels,pcb_subjects');
  targetUrl.searchParams.set(
    'QUERY_LAYERS',
    requestUrl.searchParams.get('queryLayers') ?? requestUrl.searchParams.get('layers') ?? 'pcb_parcels,pcb_subjects',
  );
  targetUrl.searchParams.set('STYLES', requestUrl.searchParams.get('styles') ?? 'default,default');
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

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(pcbSessionCookieName)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Missing frontend session.' }, { status: 401 });
  }

  const targetUrl = getQgisRequestUrl(request);

  if (!targetUrl) {
    return NextResponse.json({ message: 'QGIS publication target is not configured.' }, { status: 503 });
  }

  const response = await fetch(targetUrl, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  const responseText = await response.text();

  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
