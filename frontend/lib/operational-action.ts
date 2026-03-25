export interface OperationalActionRouter {
  push(href: string): void;
  refresh(): void;
}

interface ProxyAuthErrorPayload {
  message?: string;
  statusCode?: number;
  error?: {
    code?: string;
    type?: string;
    message?: string;
    details?: unknown;
    path?: string;
    timestamp?: string;
    requestId?: string;
  };
  loginPath?: string;
}

export interface OperationalActionFailure {
  redirected: boolean;
  kind: 'authentication' | 'authorization' | 'domain' | 'runtime';
  code: string | null;
  message: string;
  requestId: string | null;
}

export async function resolveOperationalActionFailure(
  response: Response,
  router: OperationalActionRouter,
  fallbackMessage: string,
): Promise<OperationalActionFailure | null> {
  if (response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as ProxyAuthErrorPayload | null;
  const message = payload?.error?.message ?? payload?.message ?? `${fallbackMessage} (${response.status})`;
  const code = payload?.error?.code ?? null;
  const requestId = payload?.error?.requestId ?? null;
  const kind =
    response.status === 401
      ? 'authentication'
      : response.status === 403
        ? 'authorization'
        : response.status >= 500
          ? 'runtime'
          : 'domain';

  if ((response.status === 401 || response.status === 403) && payload?.loginPath) {
    router.push(payload.loginPath);
    router.refresh();

    return {
      redirected: true,
      kind,
      code,
      message,
      requestId,
    };
  }

  return {
    redirected: false,
    kind,
    code,
    message,
    requestId,
  };
}
