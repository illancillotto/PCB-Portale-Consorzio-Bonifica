import Link from 'next/link';
import { ApiError } from '../lib/api';

interface ServerApiErrorAction {
  href: string;
  label: string;
}

interface ServerApiErrorStateProps {
  error: ApiError;
  primaryAction?: ServerApiErrorAction;
  secondaryAction?: ServerApiErrorAction;
}

const toneByKind: Record<
  ApiError['kind'],
  {
    eyebrow: string;
    title: string;
    container: string;
  }
> = {
  authentication: {
    eyebrow: 'Sessione',
    title: 'Autenticazione richiesta',
    container: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  authorization: {
    eyebrow: 'Permessi',
    title: 'Permessi insufficienti',
    container: 'border-orange-200 bg-orange-50 text-orange-900',
  },
  domain: {
    eyebrow: 'Dominio',
    title: 'Dato o operazione non disponibili',
    container: 'border-rose-200 bg-rose-50 text-rose-900',
  },
  runtime: {
    eyebrow: 'Runtime',
    title: 'Errore infrastrutturale o applicativo',
    container: 'border-[#d8b7ae] bg-[#fff8f6] text-[#9b3d2e]',
  },
};

export function ServerApiErrorState({
  error,
  primaryAction,
  secondaryAction,
}: ServerApiErrorStateProps) {
  const tone = toneByKind[error.kind];
  const loginHref =
    error.kind === 'authentication' && primaryAction
      ? `/login?next=${encodeURIComponent(primaryAction.href)}&reason=session`
      : null;

  return (
    <div className={`rounded-[28px] border p-6 ${tone.container}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">{tone.eyebrow}</p>
      <h2 className="mt-3 text-xl font-semibold">{tone.title}</h2>
      <p className="mt-3 text-sm leading-6">{error.message}</p>
      <div className="mt-4 grid gap-2 text-xs opacity-85 md:grid-cols-2">
        {error.code ? <p>Codice: {error.code}</p> : null}
        {error.statusCode ? <p>Status: {error.statusCode}</p> : null}
        {error.requestId ? <p className="break-all">Request ID: {error.requestId}</p> : null}
      </div>
      <p className="mt-4 text-xs opacity-85">
        Se il problema persiste, conserva il request ID per le verifiche operative.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {error.kind === 'authentication' && loginHref ? (
          <Link
            href={loginHref}
            className="rounded-full border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
          >
            Vai al login
          </Link>
        ) : primaryAction ? (
          <Link
            href={primaryAction.href}
            className="rounded-full border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
          >
            {primaryAction.label}
          </Link>
        ) : null}
        {secondaryAction ? (
          <Link
            href={secondaryAction.href}
            className="rounded-full border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
