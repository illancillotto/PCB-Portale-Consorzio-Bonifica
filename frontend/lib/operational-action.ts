export interface OperationalActionRouter {
  push(href: string): void;
  refresh(): void;
}

interface ProxyAuthErrorPayload {
  message?: string;
  loginPath?: string;
}

interface OperationalActionFailure {
  redirected: boolean;
  message: string;
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
  const message = payload?.message ?? `${fallbackMessage} (${response.status})`;

  if ((response.status === 401 || response.status === 403) && payload?.loginPath) {
    router.push(payload.loginPath);
    router.refresh();

    return {
      redirected: true,
      message,
    };
  }

  return {
    redirected: false,
    message,
  };
}
