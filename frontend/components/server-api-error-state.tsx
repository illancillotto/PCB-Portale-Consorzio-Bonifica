import { ApiError } from '../lib/api';

interface ServerApiErrorStateProps {
  error: ApiError;
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

export function ServerApiErrorState({ error }: ServerApiErrorStateProps) {
  const tone = toneByKind[error.kind];

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
    </div>
  );
}
