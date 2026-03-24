export type AuthRedirectReason = 'authentication_required' | 'unauthorized';

export function normalizeNextPath(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return undefined;
  }

  try {
    const normalized = new URL(nextPath, 'http://pcb.local');
    return `${normalized.pathname}${normalized.search}${normalized.hash}`;
  } catch {
    return undefined;
  }
}

export function buildLoginRedirectPath(
  reason: AuthRedirectReason,
  nextPath?: string | null,
) {
  const normalizedNextPath = normalizeNextPath(nextPath);
  const params = new URLSearchParams({
    reason,
  });

  if (normalizedNextPath) {
    params.set('next', normalizedNextPath);
  }

  return `/login?${params.toString()}`;
}
