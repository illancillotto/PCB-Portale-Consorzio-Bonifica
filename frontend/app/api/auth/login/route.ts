import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { pcbSessionCookieName } from '../../../../lib/auth';

const keycloakBaseUrl = process.env.PCB_KEYCLOAK_URL ?? 'http://127.0.0.1:8180';
const keycloakRealm = process.env.PCB_KEYCLOAK_REALM ?? 'pcb';
const keycloakClientId = process.env.PCB_KEYCLOAK_CLIENT_ID ?? 'pcb-backend';
const keycloakClientSecret = process.env.PCB_KEYCLOAK_CLIENT_SECRET ?? 'change-me';
const backendBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:5010/api/v1';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json({ message: 'Username e password sono obbligatori.' }, { status: 400 });
  }

  const tokenResponse = await fetch(
    `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: keycloakClientId,
        client_secret: keycloakClientSecret,
        username,
        password,
      }),
    },
  );

  if (!tokenResponse.ok) {
    return NextResponse.json({ message: 'Credenziali non valide.' }, { status: 401 });
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
  };
  const accessToken = tokenPayload.access_token;

  if (!accessToken) {
    return NextResponse.json({ message: 'Token Keycloak non disponibile.' }, { status: 502 });
  }

  const validationResponse = await fetch(`${backendBaseUrl}/auth/operator-access`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!validationResponse.ok) {
    return NextResponse.json(
      { message: 'Il token e` valido ma non autorizzato per l’accesso operativo PCB.' },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(pcbSessionCookieName, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60,
  });

  return NextResponse.json({ authenticated: true });
}
