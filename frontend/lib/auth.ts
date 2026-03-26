import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  buildLoginRedirectPath,
} from './auth-redirect';

const backendBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:5010/api/v1';

export const pcbSessionCookieName = 'pcb_session';

export interface AuthenticatedPrincipal {
  subject: string;
  preferredUsername: string;
  email: string | null;
  realmRoles: string[];
  issuedAt: number | null;
  expiresAt: number | null;
}

export interface FrontendSession {
  accessToken: string;
  principal: AuthenticatedPrincipal;
}

async function fetchBackendSession(accessToken: string, path: string) {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<{
    authenticated?: boolean;
    authorized?: boolean;
    principal?: AuthenticatedPrincipal;
  }>;
}

export async function getOptionalSession(): Promise<FrontendSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(pcbSessionCookieName)?.value;

  if (!accessToken) {
    return null;
  }

  const session = await fetchBackendSession(accessToken, '/auth/session');

  if (!session?.authenticated || !session.principal) {
    return null;
  }

  return {
    accessToken,
    principal: session.principal,
  };
}

export async function requireOperatorSession(nextPath?: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(pcbSessionCookieName)?.value;

  if (!accessToken) {
    redirect(buildLoginRedirectPath('authentication_required', nextPath));
  }

  const authorization = await fetchBackendSession(accessToken, '/auth/operator-access');

  if (!authorization?.authorized || !authorization.principal) {
    redirect(buildLoginRedirectPath('unauthorized', nextPath));
  }

  return {
    accessToken,
    principal: authorization.principal,
  };
}
